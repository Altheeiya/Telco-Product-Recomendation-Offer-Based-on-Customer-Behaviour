const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

// Route lama
router.post('/generate', authMiddleware, recommendationController.generateRecommendation);
router.get('/', authMiddleware, recommendationController.getMyRecommendations);

// ⭐ ROUTE BARU
router.get('/check-and-generate', authMiddleware, recommendationController.checkAndGenerateIfEmpty);

module.exports = router;