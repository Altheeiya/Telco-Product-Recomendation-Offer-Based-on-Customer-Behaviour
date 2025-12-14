const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes - siapapun bisa akses
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected route - hanya admin yang bisa create product
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);

module.exports = router;