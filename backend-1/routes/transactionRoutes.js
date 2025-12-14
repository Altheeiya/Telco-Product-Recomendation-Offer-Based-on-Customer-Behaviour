const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware'); // Import Middleware

// Semua route di sini DIPROTEKSI (Wajib Login)
// POST /api/transactions (Beli)
router.post('/', authMiddleware, transactionController.createTransaction);

// GET /api/transactions (Lihat History)
router.get('/', authMiddleware, transactionController.getMyTransactions);

module.exports = router;