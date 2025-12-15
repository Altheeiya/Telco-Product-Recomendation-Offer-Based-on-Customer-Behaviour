const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
// PERBAIKAN: Gunakan destructuring untuk mengambil 'authenticateToken'
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/ml/generate-recommendation
// PERBAIKAN: Ganti 'authMiddleware' menjadi 'authenticateToken'
router.post('/generate-recommendation', authenticateToken, mlController.generateRecommendation);

// GET /api/ml/health
router.get('/health', mlController.checkMLHealth);

module.exports = router;