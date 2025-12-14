const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Semua routes di sini butuh auth + admin role
router.use(authenticateToken);
router.use(isAdmin);

// Dashboard endpoints
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/sales-chart', adminController.getSalesChart);
router.get('/dashboard/top-products', adminController.getTopProducts);
router.get('/dashboard/recent-transactions', adminController.getRecentTransactions);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Transaction management
router.get('/transactions', adminController.getAllTransactionsAdmin);

// Product management
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Reports
router.get('/reports/generate', adminController.generateReport);

module.exports = router;