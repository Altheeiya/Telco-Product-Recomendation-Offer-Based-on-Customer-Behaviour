const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// PERBAIKAN: Gunakan destructuring
const { authenticateToken } = require('../middleware/authMiddleware');

// API d & e
// PERBAIKAN: Gunakan 'authenticateToken' di kedua route ini
router.get('/profile', authenticateToken, userController.getUserProfile);

// API f
router.put('/profile', authenticateToken, userController.updateProfile);

module.exports = router;