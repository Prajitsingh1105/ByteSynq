const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
    endpointId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    forwardUrl: {
        type: String,
        default: ""
    },
    secretKey: {
        type: String,
        required: true
    },
    retentionDays: {
        type: Number,
        default: 7
    },
    mockResponse: {
        statusCode: { type: Number, default: 200 },
        body: { type: String, default: '{"message": "Webhook intercepted!"}' },
        headers: { type: Map, of: String, default: {} }
    },
    validationSchema: {
        type: String,
        default: ""
    },
    alertSettings: {
        webhookUrl: { type: String, default: "" },
        triggerOn: { type: String, default: "forward_fail" },
        emailAlerts: { type: Boolean, default: false },
        notifyOnForwardFail: { type: Boolean, default: true },
        notifyOnInactivity: { type: Boolean, default: false },
        inactivityThresholdHours: { type: Number, default: 24 }
    },
    lastInactivityAlertSentAt: {
        type: Date,
        default: null
    },
    security: {
        rateLimitEnabled: { type: Boolean, default: false },
        rateLimitRequests: { type: Number, default: 60 },
        rateLimitWindowMs: { type: Number, default: 60000 },
        ipWhitelistEnabled: { type: Boolean, default: false },
        ipWhitelist: { type: [String], default: [] }
    },
    integrations: [{
        provider: { type: String, enum: ['stripe', 'github', 'shopify', 'twilio'] },
        secret: { type: String },
        isActive: { type: Boolean, default: false }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Endpoint', endpointSchema);
