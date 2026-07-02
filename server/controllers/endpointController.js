const Redis = require("ioredis");
const crypto = require("crypto");
const axios = require("axios");
const Ajv = require("ajv");
const Endpoint = require("../models/Endpoint");
const Webhook = require("../models/Webhook");
const User = require("../models/User");
const { sendAlertEmail } = require("../utils/emailService");

const ajv = new Ajv();

const redisOptions = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false
};

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, redisOptions) 
  : new Redis({
      host: '127.0.0.1',
      port: 6385,
      family: 4,
      ...redisOptions
    });

async function createEndpoint(req, res) {
    try {
        const endpointId = "req_" + Math.random().toString(36).substring(2, 7);
        const secretKey = crypto.randomBytes(16).toString('hex');
        const newEndpoint = await Endpoint.create({ 
            endpointId, 
            secretKey,
            userId: req.user._id
        });
        res.status(201).json({ success: true, endpoint: newEndpoint });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to create endpoint" });
    }
}

async function getEndpoints(req, res) {
    try {
        const endpoints = await Endpoint.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, endpoints });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch endpoints" });
    }
}

async function getWebhooks(req, res) {
    try {
        const { endpointId } = req.params;
        const { search, method, status } = req.query;

        const endpoint = await Endpoint.findOne({ endpointId, userId: req.user._id });
        if (!endpoint) {
            return res.status(404).json({ success: false, error: "Endpoint not found or unauthorized" });
        }
        
        const query = { endpointId };
        
        if (method && method !== 'ALL') {
            query.method = method.toUpperCase();
        }
        
        if (status && status !== 'ALL') {
            query.status = parseInt(status);
        }
        
        if (search) {
            const orConditions = [
                { path: { $regex: search, $options: 'i' } },
                { method: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } }
            ];

            if (search.includes(':')) {
                const parts = search.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    
                    const payloadQuery = {};
                    if (value.toLowerCase() === 'true') {
                        payloadQuery[`payload.${key}`] = true;
                    } else if (value.toLowerCase() === 'false') {
                        payloadQuery[`payload.${key}`] = false;
                    } else if (!isNaN(Number(value)) && value !== '') {
                        payloadQuery[`payload.${key}`] = Number(value);
                    } else {
                        payloadQuery[`payload.${key}`] = { $regex: value, $options: 'i' };
                    }
                    orConditions.push(payloadQuery);
                }
            }
            query.$or = orConditions;
        }
        
        const webhooks = await Webhook.find(query).sort({ createdAt: -1 }).limit(50);
        
        res.status(200).json({ success: true, webhooks });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch webhooks" });
    }
}

async function updateEndpointSettings(req, res) {
    const { endpointId } = req.params;
    const { forwardUrl, retentionDays, mockResponse, validationSchema, alertSettings, integrations, name } = req.body;
    try {
        const updateData = {};
        if (forwardUrl !== undefined) updateData.forwardUrl = forwardUrl;
        if (retentionDays !== undefined) updateData.retentionDays = retentionDays;
        if (name !== undefined) {
            updateData.name = name;
        }
        if (mockResponse) {
            updateData.mockResponse = mockResponse;
        }
        if (validationSchema !== undefined) {
            updateData.validationSchema = validationSchema;
        }
        if (alertSettings) {
            updateData.alertSettings = alertSettings;
        }
        if (req.body.security) {
            updateData.security = req.body.security;
        }
        if (integrations) {
            updateData.integrations = integrations;
        }
        const endpoint = await Endpoint.findOneAndUpdate(
            { endpointId, userId: req.user._id },
            updateData,
            { new: true }
        );
        if (!endpoint) {
            return res.status(404).json({ success: false, error: "Endpoint not found" });
        }
        res.status(200).json({ success: true, endpoint });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to update settings" });
    }
}

async function rotateSecretKey(req, res) {
    const { endpointId } = req.params;
    try {
        const newSecretKey = crypto.randomBytes(16).toString('hex');
        const endpoint = await Endpoint.findOneAndUpdate(
            { endpointId, userId: req.user._id },
            { secretKey: newSecretKey },
            { new: true }
        );
        if (!endpoint) {
            return res.status(404).json({ success: false, error: "Endpoint not found" });
        }
        res.status(200).json({ success: true, secretKey: newSecretKey, endpoint });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to rotate secret key" });
    }
}

async function handleEndpointCatching(req, res) {
    const startTime = process.hrtime();
    const { endpointId } = req.params;
    
    try {
        // Validate endpoint exists
        const endpoint = await Endpoint.findOne({ endpointId });
        if (!endpoint) {
            return res.status(404).json({ success: false, error: "Endpoint not found" });
        }

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

        // Security: IP Whitelisting
        if (endpoint.security?.ipWhitelistEnabled && endpoint.security.ipWhitelist?.length > 0) {
            // Strip potential port numbers from IPv4/IPv6 mapped addresses
            const cleanIp = clientIp.split(',')[0].trim().replace(/^::ffff:/, '');
            if (!endpoint.security.ipWhitelist.includes(cleanIp)) {
                console.log(`[!] Blocked webhook from unauthorized IP: ${cleanIp}`);
                return res.status(403).json({ success: false, error: "Access Denied: IP not whitelisted." });
            }
        }

        // Security: Rate Limiting
        if (endpoint.security?.rateLimitEnabled) {
            try {
                const windowKey = `ratelimit:${endpointId}:${clientIp}`;
                const requestCount = await redis.incr(windowKey);
                if (requestCount === 1) {
                    await redis.pexpire(windowKey, endpoint.security.rateLimitWindowMs || 60000);
                }
                if (requestCount > (endpoint.security.rateLimitRequests || 60)) {
                    console.log(`[!] Rate limit exceeded for endpoint ${endpointId} by IP: ${clientIp}`);
                    return res.status(429).json({ success: false, error: "Too Many Requests" });
                }
            } catch (redisErr) {
                console.error("Failed to check rate limit", redisErr);
            }
        }

        // Native Signature Verification
        if (endpoint.integrations && endpoint.integrations.length > 0) {
            const activeIntegrations = endpoint.integrations.filter(i => i.isActive);
            for (const integration of activeIntegrations) {
                if (integration.provider === 'github' && req.headers['x-hub-signature-256']) {
                    const signature = req.headers['x-hub-signature-256'];
                    const hmac = crypto.createHmac('sha256', integration.secret);
                    const digest = 'sha256=' + hmac.update(req.rawBody || '').digest('hex');
                    if (signature !== digest) {
                        console.log(`[!] Blocked invalid GitHub signature for endpoint ${endpointId}`);
                        return res.status(401).json({ success: false, error: 'Invalid GitHub Webhook Signature' });
                    }
                }
            }
        }

        const payload = req.body;
        
        let validationError = null;
        if (endpoint.validationSchema) {
            try {
                const schemaObj = JSON.parse(endpoint.validationSchema);
                const validate = ajv.compile(schemaObj);
                const valid = validate(payload);
                if (!valid) {
                    validationError = ajv.errorsText(validate.errors);
                }
            } catch (e) {
                validationError = "Schema Error: " + e.message;
            }
        }

        const statusCode = endpoint.mockResponse?.statusCode || (validationError ? 400 : 200);

        const diff = process.hrtime(startTime);
        const latencyMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(1) + 'ms';

        const webhookData = {
            id: Math.random().toString(36).substring(7),
            endpointId,
            method: req.method,
            path: req.originalUrl,
            time: new Date().toISOString(),
            latency: latencyMs,
            status: statusCode,
            headers: req.headers,
            payload: payload,
            validationError: validationError
        };
        
        console.log(`\n Webhook caught for endpoint: ${endpointId}`);
        if (validationError) console.log(`Validation Failed: ${validationError}`);
        
        // Save to MongoDB
        const savedWebhook = await Webhook.create(webhookData);

        // Buffer in Redis
        await redis.lpush(`queue:${endpointId}`, JSON.stringify(savedWebhook));
        await redis.publish(`stream:${endpointId}`, JSON.stringify(savedWebhook));
        
        console.log("Successfully saved to MongoDB, buffered in Redis, and published!");
        
        // Proxy Forwarding (Fire and forget)
        if (endpoint.forwardUrl) {
            const payloadString = JSON.stringify(payload);
            const signature = crypto.createHmac('sha256', endpoint.secretKey)
                                    .update(payloadString)
                                    .digest('hex');
            
            axios.post(endpoint.forwardUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-ByteSynq-Signature': signature
                }
            }).then(async () => {
                console.log(`Successfully forwarded webhook to ${endpoint.forwardUrl}`);
                await redis.del(`fail_count:${endpointId}`);
            }).catch(async (err) => {
                console.error(`Failed to forward webhook to ${endpoint.forwardUrl}:`, err.message);
                if (endpoint.alertSettings) {
                    if (endpoint.alertSettings.webhookUrl) {
                        axios.post(endpoint.alertSettings.webhookUrl, {
                            content: `🚨 **ByteSynq Alert**\nFailed to forward webhook to ${endpoint.forwardUrl}\nError: ${err.message}\nEndpoint ID: ${endpointId}`
                        }).catch(e => console.error("Failed to send webhook alert", e.message));
                    }
                    if (endpoint.alertSettings.emailAlerts && endpoint.alertSettings.notifyOnForwardFail) {
                        try {
                            const failCount = await redis.incr(`fail_count:${endpointId}`);
                            if (failCount >= 3) {
                                const user = await User.findById(endpoint.userId);
                                if (user && user.email) {
                                    await sendAlertEmail(
                                        user.email,
                                        `🚨 Proxy Forwarding Failed for ${endpoint.name || endpointId}`,
                                        `Your ByteSynq endpoint (${endpoint.name || endpointId}) has failed to forward 3 consecutive webhooks to ${endpoint.forwardUrl}.\n\nLatest Error: ${err.message}\n\nPlease check your destination server.`
                                    );
                                }
                                await redis.del(`fail_count:${endpointId}`);
                            }
                        } catch (redisErr) {
                            console.error("Failed to track proxy failures", redisErr);
                        }
                    }
                }
            });
        }

        if (endpoint.mockResponse && endpoint.mockResponse.headers) {
            for (const [key, value] of endpoint.mockResponse.headers.entries()) {
                res.setHeader(key, value);
            }
        }
        
        let responseBody = { success: true, message: "Webhook intercepted!" };
        if (validationError) {
            responseBody = { success: false, error: validationError };
        } else if (endpoint.mockResponse && endpoint.mockResponse.body) {
            try {
                responseBody = JSON.parse(endpoint.mockResponse.body);
            } catch (e) {
                responseBody = endpoint.mockResponse.body;
            }
        }

        res.status(statusCode).send(responseBody);
    } catch (err) {
        console.log("Error processing webhook: ", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

async function getEndpointAnalytics(req, res) {
    const { endpointId } = req.params;
    try {
        const endpoint = await Endpoint.findOne({ endpointId, userId: req.user._id });
        if (!endpoint) {
            return res.status(404).json({ success: false, error: "Endpoint not found or unauthorized" });
        }

        const pipeline = [
            { $match: { endpointId } },
            {
                $facet: {
                    totalEvents: [{ $count: "count" }],
                    successfulEvents: [
                        { $match: { status: { $gte: 200, $lt: 300 } } },
                        { $count: "count" }
                    ],
                    latency: [
                        {
                            $project: {
                                latencyVal: {
                                    $convert: {
                                        input: {
                                            $replaceAll: {
                                                input: "$latency",
                                                find: "ms",
                                                replacement: ""
                                            }
                                        },
                                        to: "double",
                                        onError: 0,
                                        onNull: 0
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgLatency: { $avg: "$latencyVal" }
                            }
                        }
                    ],
                    statusCodes: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    last24Hours: [
                        {
                            $match: {
                                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateTrunc: {
                                        date: "$createdAt",
                                        unit: "hour"
                                    }
                                },
                                volume: { $sum: 1 }
                            }
                        },
                        { $sort: { "_id": 1 } }
                    ]
                }
            }
        ];

        const result = await Webhook.aggregate(pipeline);
        const data = result[0];

        const total = data.totalEvents[0]?.count || 0;
        const successCount = data.successfulEvents[0]?.count || 0;
        const successRate = total === 0 ? "0%" : ((successCount / total) * 100).toFixed(1) + "%";

        const rawAvgLatency = data.latency[0]?.avgLatency || 0;
        const avgLatency = rawAvgLatency.toFixed(1) + "ms";

        const colorMap = {
            200: '#10b981', 201: '#059669', 
            400: '#f59e0b', 401: '#f97316', 
            404: '#f97316', 500: '#ef4444'
        };
        const statusCodeData = data.statusCodes.map(s => ({
            code: `${s._id} ${s._id === 200 ? 'OK' : s._id === 201 ? 'Created' : s._id === 400 ? 'Bad Req' : s._id === 401 ? 'Unauth' : s._id === 404 ? 'Not Found' : s._id >= 500 ? 'Error' : ''}`.trim(),
            count: s.count,
            color: colorMap[s._id] || '#64748b'
        }));

        const volumeData = data.last24Hours.map(v => ({
            time: v._id,
            volume: v.volume,
            events: v.volume
        }));

        res.status(200).json({
            success: true,
            totalEvents: total,
            successRate,
            avgLatency,
            volumeData,
            statusCodeData
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate analytics" });
    }
}

async function replayWebhook(req, res) {
    const { endpointId, webhookId } = req.params;
    
    try {
        const endpoint = await Endpoint.findOne({ endpointId, userId: req.user._id });
        if (!endpoint) {
            return res.status(404).json({ success: false, error: "Endpoint not found or unauthorized" });
        }

        const webhook = await Webhook.findOne({ id: webhookId, endpointId });
        if (!webhook) {
            return res.status(404).json({ success: false, error: "Webhook not found" });
        }

        // 1. Broadcast to Socket.io (so CLI catches it)
        await redis.publish(`stream:${endpointId}`, JSON.stringify(webhook));

        // 2. HTTP Forward (if configured)
        if (endpoint.forwardUrl) {
            const payloadString = JSON.stringify(webhook.payload);
            const signature = crypto.createHmac('sha256', endpoint.secretKey)
                                    .update(payloadString)
                                    .digest('hex');
            
            axios.post(endpoint.forwardUrl, webhook.payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-ByteSynq-Signature': signature
                }
            }).catch(e => console.error("Replay forward failed", e.message));
        }
        
        res.status(200).json({ success: true, message: "Webhook replayed successfully" });
    } catch (error) {
        console.error("Error replaying webhook:", error.message);
        res.status(500).json({ success: false, error: "Failed to replay webhook to target URL" });
    }
}

module.exports = {
    createEndpoint,
    getEndpoints,
    getWebhooks,
    updateEndpointSettings,
    rotateSecretKey,
    handleEndpointCatching,
    getEndpointAnalytics,
    replayWebhook,
}