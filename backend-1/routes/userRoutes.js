const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Pastikan path benar

// API d & e
router.get('/profile', authMiddleware, userController.getUserProfile);
// API f
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;