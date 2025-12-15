const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// API Get Profile
router.get('/profile', authenticateToken, userController.getUserProfile);

// API Edit Profile
router.put('/profile', authenticateToken, userController.updateProfile);

// [PENTING] API Top Up Saldo
// Pastikan baris ini ada agar tidak 404
router.post('/topup', authenticateToken, userController.topUp);

module.exports = router;