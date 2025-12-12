const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/recommendations (User melihat rekomendasi mereka) - WAJIB LOGIN
router.get('/', authMiddleware, recommendationController.getMyRecommendations);

// POST /api/recommendations (Simpan prediksi) - Bisa dibuka untuk testing/internal
router.post('/', recommendationController.createRecommendation);

module.exports = router;