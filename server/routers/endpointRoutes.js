const express = require("express");
const { 
    handleEndpointCatching,
    createEndpoint,
    getEndpoints,
    getWebhooks,
    updateEndpointSettings,
    rotateSecretKey,
    getEndpointAnalytics,
    replayWebhook
} = require("../controllers/endpointController");
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/api/v1/catch/:endpointId", handleEndpointCatching);
// Support other methods if needed
router.get("/api/v1/catch/:endpointId", handleEndpointCatching);
router.put("/api/v1/catch/:endpointId", handleEndpointCatching);
router.patch("/api/v1/catch/:endpointId", handleEndpointCatching);
router.delete("/api/v1/catch/:endpointId", handleEndpointCatching);

router.post("/api/v1/endpoints", protect, createEndpoint);
router.get("/api/v1/endpoints", protect, getEndpoints);
router.get("/api/v1/endpoints/:endpointId/webhooks", protect, getWebhooks);
router.get("/api/v1/endpoints/:endpointId/analytics", protect, getEndpointAnalytics);

router.patch("/api/v1/endpoints/:endpointId/settings", protect, updateEndpointSettings);
router.post("/api/v1/endpoints/:endpointId/rotate-secret", protect, rotateSecretKey);
router.post("/api/v1/endpoints/:endpointId/webhooks/:webhookId/replay", protect, replayWebhook);

module.exports = router;