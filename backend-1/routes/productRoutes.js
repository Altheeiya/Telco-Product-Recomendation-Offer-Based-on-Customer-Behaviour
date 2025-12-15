const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
// UBAH DISINI: Ambil authenticateToken dan isAdmin dari authMiddleware.js
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin only
// UBAH DISINI: Gunakan variabel yang sudah di-destructure
router.post('/', authenticateToken, isAdmin, productController.createProduct);

module.exports = router;