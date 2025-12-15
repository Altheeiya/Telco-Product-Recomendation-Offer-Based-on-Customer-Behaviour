const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
// UBAH BARIS INI: Gunakan destructuring untuk mengambil fungsi spesifik
const { authenticateToken } = require('../middleware/authMiddleware'); 

// Semua route di sini DIPROTEKSI (Wajib Login)

// POST /api/transactions (Beli)
// Karena sudah didestructure di atas, panggil langsung 'authenticateToken'
router.post('/', authenticateToken, transactionController.createTransaction);

// GET /api/transactions (Lihat History)
router.get('/', authenticateToken, transactionController.getMyTransactions);

module.exports = router;