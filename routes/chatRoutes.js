const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

// All chat routes require authentication
router.use(verifyToken);

// Chat session routes
router.get('/session/start', chatController.startChatSession);
router.get('/session/active', chatController.getActiveSession);
router.post('/message', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);
router.put('/session/:sessionId/end', chatController.endChatSession);

// Lawyer routes
router.get('/lawyers', chatController.getLawyers);

module.exports = router;
