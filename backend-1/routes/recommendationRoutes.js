const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
// UBAH BARIS INI: Ambil fungsi spesifik 'authenticateToken'
const { authenticateToken } = require('../middleware/authMiddleware');

// Route lama
// Ganti 'authMiddleware' menjadi 'authenticateToken'
router.post('/generate', authenticateToken, recommendationController.generateRecommendation);
router.get('/', authenticateToken, recommendationController.getMyRecommendations);

// ⭐ ROUTE BARU
router.get('/check-and-generate', authenticateToken, recommendationController.checkAndGenerateIfEmpty);

module.exports = router;