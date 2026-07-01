const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    endpointId: {
        type: String,
        required: true,
        index: true
    },
    method: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    latency: {
        type: String
    },
    status: {
        type: Number,
        default: 200
    },
    headers: {
        type: mongoose.Schema.Types.Mixed
    },
    payload: {
        type: mongoose.Schema.Types.Mixed
    },
    validationError: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Webhook', webhookSchema);
