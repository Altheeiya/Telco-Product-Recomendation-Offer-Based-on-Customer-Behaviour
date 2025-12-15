const { User, Product, Transaction, UserBehavior } = require('../models');
const { Op } = require('sequelize');

// ==================== DASHBOARD STATS ====================
exports.getDashboardStats = async (req, res) => {
  try {
    // Total Revenue
    const totalRevenue = await Transaction.sum('amount') || 0;
    
    // Total Transactions
    const totalTransactions = await Transaction.count();
    
    // Total Users (exclude admin)
    const totalUsers = await User.count({
      where: { role: 'user' }
    });
    
    // Total Products
    const totalProducts = await Product.count();
    
    // Today's Revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenue = await Transaction.sum('amount', {
      where: {
        transaction_date: {
          [Op.gte]: today
        }
      }
    }) || 0;
    
    // Today's Transactions
    const todayTransactions = await Transaction.count({
      where: {
        transaction_date: {
          [Op.gte]: today
        }
      }
    });

    res.json({
      totalRevenue,
      totalTransactions,
      totalUsers,
      totalProducts,
      todayRevenue,
      todayTransactions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== SALES CHART ====================
exports.getSalesChart = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Untuk MySQL, kita gunakan approach yang berbeda
    let dateFormat;
    let interval;
    
    if (period === 'month') {
      dateFormat = '%b %Y';
      interval = '6 MONTH';
    } else if (period === 'week') {
      dateFormat = '%d %b';
      interval = '8 WEEK';
    } else if (period === 'year') {
      dateFormat = '%Y';
      interval = '3 YEAR';
    }

    const transactions = await Transaction.sequelize.query(`
      SELECT 
        DATE_FORMAT(transaction_date, '${dateFormat}') as month,
        COALESCE(SUM(amount), 0) as revenue
      FROM Transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY DATE_FORMAT(transaction_date, '${dateFormat}')
      ORDER BY transaction_date ASC
    `, {
      type: Transaction.sequelize.QueryTypes.SELECT
    });

    res.json(transactions || []);
  } catch (error) {
    console.error('Error fetching sales chart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== TOP PRODUCTS ====================
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Product.findAll({
      include: [{
        model: Transaction,
        as: 'transactions',
        attributes: []
      }],
      attributes: [
        'id',
        'name',
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('transactions.id')), 'sales'],
        [Transaction.sequelize.fn('COALESCE', 
          Transaction.sequelize.fn('SUM', Transaction.sequelize.col('transactions.amount')), 
          0), 'revenue']
      ],
      group: ['Product.id'],
      order: [[Transaction.sequelize.literal('sales'), 'DESC']],
      limit: 5
    });
    
    const formatted = topProducts.map(p => ({
      id: p.id,
      name: p.name,
      sales: parseInt(p.get('sales')) || 0,
      revenue: parseFloat(p.get('revenue')) || 0
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== RECENT TRANSACTIONS ====================
exports.getRecentTransactions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['name']
        }
      ],
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit)
    });
    
    const formatted = transactions.map(t => ({
      id: t.id,
      user: t.user?.username || 'Unknown',
      product: t.product?.name || 'Unknown',
      amount: t.amount,
      date: t.transaction_date,
      status: 'completed'
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== GET ALL USERS ====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'user' },
      include: [{
        model: Transaction,
        as: 'transactions',
        attributes: []
      }],
      attributes: [
        'id',
        'username',
        'email',
        'role',
        'createdAt',
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('transactions.id')), 'total_transactions'],
        [Transaction.sequelize.fn('COALESCE',
          Transaction.sequelize.fn('SUM', Transaction.sequelize.col('transactions.amount')),
          0), 'total_spent']
      ],
      group: ['User.id'],
      order: [['createdAt', 'DESC']]
    });
    
    const formatted = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      created_at: u.createdAt,
      total_transactions: parseInt(u.get('total_transactions')) || 0,
      total_spent: parseFloat(u.get('total_spent')) || 0
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== GET ALL TRANSACTIONS (ADMIN) ====================
exports.getAllTransactionsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, startDate, endDate } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.transaction_date = {};
      if (startDate) where.transaction_date[Op.gte] = new Date(startDate);
      if (endDate) where.transaction_date[Op.lte] = new Date(endDate);
    }
    
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'category']
        }
      ],
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    const formatted = rows.map(t => ({
      id: t.id,
      user_id: t.userId,
      user: t.user?.username || 'Unknown',
      user_email: t.user?.email || '',
      product_id: t.productId,
      product: t.product?.name || 'Unknown',
      category: t.product?.category || '',
      amount: t.amount,
      date: t.transaction_date,
      status: 'completed'
    }));
    
    res.json({
      transactions: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== UPDATE USER ====================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    
    if (!username || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check email duplicate
    const emailExists = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: id }
      }
    });
    
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    await user.update({ username, email, role });
    
    res.json({ 
      message: 'User updated successfully', 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== DELETE USER ====================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    
    // Check transactions
    const transactionCount = await Transaction.count({
      where: { userId: id }
    });
    
    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing transactions' 
      });
    }
    
    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== UPDATE PRODUCT ====================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, validity_days } = req.body;
    
    if (!name || !category || !price || !description || !validity_days) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.update({
      name,
      category,
      price,
      description,
      validity_days
    });
    
    res.json({ 
      message: 'Product updated successfully', 
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== DELETE PRODUCT ====================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check transactions
    const transactionCount = await Transaction.count({
      where: { productId: id }
    });
    
    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product with existing transactions' 
      });
    }
    
    await product.destroy();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== GENERATE REPORT ====================
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.transaction_date = {};
      if (startDate) where.transaction_date[Op.gte] = new Date(startDate);
      if (endDate) where.transaction_date[Op.lte] = new Date(endDate);
    }
    
    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'category']
        }
      ],
      order: [['transaction_date', 'DESC']]
    });
    
    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalTransactions = transactions.length;
    
    const categoryStats = {};
    transactions.forEach(t => {
      const cat = t.product?.category || 'Unknown';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { count: 0, revenue: 0 };
      }
      categoryStats[cat].count++;
      categoryStats[cat].revenue += parseFloat(t.amount);
    });
    
    const formatted = transactions.map(t => ({
      id: t.id,
      transaction_date: t.transaction_date,
      username: t.user?.username || 'Unknown',
      email: t.user?.email || '',
      product_name: t.product?.name || 'Unknown',
      category: t.product?.category || '',
      amount: t.amount
    }));
    
    res.json({
      summary: {
        totalRevenue,
        totalTransactions,
        startDate: startDate || null,
        endDate: endDate || null,
        categoryStats
      },
      transactions: formatted
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};