const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validasi input untuk Register
const validateRegister = [
    body('username').notEmpty().withMessage('Username wajib diisi'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
];

// Endpoint: POST /api/auth/register
router.post('/register', validateRegister, authController.register);

// Endpoint: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;