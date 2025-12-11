const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Siapapun boleh melihat daftar produk (Public)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Untuk create, bisa diproteksi atau dibiarkan public dulu untuk testing
router.post('/', productController.createProduct);

module.exports = router;