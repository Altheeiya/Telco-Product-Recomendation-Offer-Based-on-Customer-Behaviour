const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

// API a, b, c (Tombol "Cek Penawaran")
router.post('/generate', authMiddleware, recommendationController.generateRecommendation);

// Route lama (Get History)
router.get('/', authMiddleware, recommendationController.getMyRecommendations);

module.exports = router;