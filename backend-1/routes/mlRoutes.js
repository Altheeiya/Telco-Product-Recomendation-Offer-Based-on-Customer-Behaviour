const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/ml/generate-recommendation
router.post('/generate-recommendation', authMiddleware, mlController.generateRecommendation);

// GET /api/ml/health
router.get('/health', mlController.checkMLHealth);

module.exports = router;