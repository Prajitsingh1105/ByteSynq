const Endpoint = require('../models/Endpoint');
const Webhook = require('../models/Webhook');
const User = require('../models/User');
const { sendAlertEmail } = require('./emailService');

async function runDataRetentionJob() {
    try {
        const endpoints = await Endpoint.find({});
        let totalDeleted = 0;

        for (const endpoint of endpoints) {
            const retentionDays = endpoint.retentionDays || 7;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            const result = await Webhook.deleteMany({
                endpointId: endpoint.endpointId,
                createdAt: { $lt: cutoffDate }
            });

            totalDeleted += result.deletedCount;
        }

        console.log(`[Cron Job] Data Retention Sweep Complete: Purged ${totalDeleted} stale webhooks across ${endpoints.length} endpoints.`);
    } catch (error) {
        console.error('[Cron Job] Failed to run data retention sweep:', error);
    }
}

async function runInactivityCheckJob() {
    try {
        const endpoints = await Endpoint.find({
            "alertSettings.emailAlerts": true,
            "alertSettings.notifyOnInactivity": true
        });

        for (const endpoint of endpoints) {
            const latestWebhook = await Webhook.findOne({ endpointId: endpoint.endpointId }).sort({ createdAt: -1 });
            if (latestWebhook) {
                const hoursSinceLastWebhook = (Date.now() - latestWebhook.createdAt.getTime()) / (1000 * 60 * 60);
                const threshold = endpoint.alertSettings.inactivityThresholdHours || 24;

                if (hoursSinceLastWebhook > threshold) {
                    // Check if we haven't alerted in the last 24 hours
                    const lastAlert = endpoint.lastInactivityAlertSentAt;
                    const hoursSinceLastAlert = lastAlert ? (Date.now() - lastAlert.getTime()) / (1000 * 60 * 60) : Infinity;

                    if (hoursSinceLastAlert > 24) {
                        const user = await User.findById(endpoint.userId);
                        if (user && user.email) {
                            const success = await sendAlertEmail(
                                user.email,
                                `⚠️ Endpoint Inactivity: ${endpoint.name || endpoint.endpointId}`,
                                `Your ByteSynq endpoint (${endpoint.name || endpoint.endpointId}) has not received any webhooks in the last ${Math.floor(hoursSinceLastWebhook)} hours (Threshold: ${threshold} hours).\n\nPlease check your source systems to ensure webhooks are still being fired.`
                            );
                            
                            if (success) {
                                endpoint.lastInactivityAlertSentAt = new Date();
                                await endpoint.save();
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('[Cron Job] Failed to run inactivity check:', error);
    }
}

function startCronJobs() {
    // Run immediately on start
    runDataRetentionJob();
    runInactivityCheckJob();
    
    // Then run retention every 1 hour (3600000 ms)
    setInterval(runDataRetentionJob, 60 * 60 * 1000);
    
    // Check for inactivity every hour
    setInterval(runInactivityCheckJob, 60 * 60 * 1000);
}

module.exports = { startCronJobs };
