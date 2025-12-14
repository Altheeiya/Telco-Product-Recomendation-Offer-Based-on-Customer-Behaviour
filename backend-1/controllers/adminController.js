// ==================== backend/controllers/adminController.js ====================
const pool = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total Revenue
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total_revenue FROM transactions'
    );
    
    // Total Transactions
    const transactionsResult = await pool.query(
      'SELECT COUNT(*) as total_transactions FROM transactions'
    );
    
    // Total Users
    const usersResult = await pool.query(
      "SELECT COUNT(*) as total_users FROM users WHERE role = 'user'"
    );
    
    // Total Products
    const productsResult = await pool.query(
      'SELECT COUNT(*) as total_products FROM products'
    );
    
    // Today's Revenue
    const todayRevenueResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as today_revenue 
       FROM transactions 
       WHERE DATE(transaction_date) = CURRENT_DATE`
    );
    
    // Today's Transactions
    const todayTransactionsResult = await pool.query(
      `SELECT COUNT(*) as today_transactions 
       FROM transactions 
       WHERE DATE(transaction_date) = CURRENT_DATE`
    );

    res.json({
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
      totalTransactions: parseInt(transactionsResult.rows[0].total_transactions),
      totalUsers: parseInt(usersResult.rows[0].total_users),
      totalProducts: parseInt(productsResult.rows[0].total_products),
      todayRevenue: parseFloat(todayRevenueResult.rows[0].today_revenue),
      todayTransactions: parseInt(todayTransactionsResult.rows[0].today_transactions)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let query;
    if (period === 'month') {
      query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', transaction_date), 'Mon YYYY') as month,
          COALESCE(SUM(amount), 0) as revenue
        FROM transactions
        WHERE transaction_date >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', transaction_date)
        ORDER BY DATE_TRUNC('month', transaction_date)
      `;
    } else if (period === 'week') {
      query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('week', transaction_date), 'DD Mon') as month,
          COALESCE(SUM(amount), 0) as revenue
        FROM transactions
        WHERE transaction_date >= NOW() - INTERVAL '8 weeks'
        GROUP BY DATE_TRUNC('week', transaction_date)
        ORDER BY DATE_TRUNC('week', transaction_date)
      `;
    } else if (period === 'year') {
      query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('year', transaction_date), 'YYYY') as month,
          COALESCE(SUM(amount), 0) as revenue
        FROM transactions
        WHERE transaction_date >= NOW() - INTERVAL '3 years'
        GROUP BY DATE_TRUNC('year', transaction_date)
        ORDER BY DATE_TRUNC('year', transaction_date)
      `;
    } else {
      // Default to month if invalid period
      query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', transaction_date), 'Mon YYYY') as month,
          COALESCE(SUM(amount), 0) as revenue
        FROM transactions
        WHERE transaction_date >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', transaction_date)
        ORDER BY DATE_TRUNC('month', transaction_date)
      `;
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales chart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        COALESCE(COUNT(t.id), 0) as sales,
        COALESCE(SUM(t.amount), 0) as revenue
      FROM products p
      LEFT JOIN transactions t ON p.id = t.product_id
      GROUP BY p.id, p.name
      ORDER BY sales DESC, revenue DESC
      LIMIT 5
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRecentTransactions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit) || 10;
    
    const result = await pool.query(`
      SELECT 
        t.id,
        u.username as user,
        p.name as product,
        t.amount,
        t.transaction_date as date,
        'completed' as status
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN products p ON t.product_id = p.id
      ORDER BY t.transaction_date DESC
      LIMIT $1
    `, [limitNum]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COALESCE(COUNT(DISTINCT t.id), 0) as total_transactions,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.username, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllTransactionsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, startDate, endDate } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    
    let query = `
      SELECT 
        t.id,
        t.user_id,
        u.username as user,
        u.email as user_email,
        t.product_id,
        p.name as product,
        p.category,
        t.amount,
        t.transaction_date as date,
        'completed' as status
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN products p ON t.product_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (userId) {
      query += ` AND t.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Count query for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM transactions t
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamIndex = 1;
    
    if (userId) {
      countQuery += ` AND t.user_id = $${countParamIndex}`;
      countParams.push(userId);
      countParamIndex++;
    }
    
    if (startDate) {
      countQuery += ` AND t.transaction_date >= $${countParamIndex}`;
      countParams.push(startDate);
      countParamIndex++;
    }
    
    if (endDate) {
      countQuery += ` AND t.transaction_date <= $${countParamIndex}`;
      countParams.push(endDate);
      countParamIndex++;
    }
    
    query += ` ORDER BY t.transaction_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);
    
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.json({
      transactions: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    
    // Validate input
    if (!username || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const checkUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is already taken by another user
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role, created_at',
      [username, email, role, id]
    );
    
    res.json({ 
      message: 'User updated successfully', 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const checkUser = await pool.query('SELECT id, role FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting admin users
    if (checkUser.rows[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    
    // Check if user has transactions
    const checkResult = await pool.query(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = $1',
      [id]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing transactions. Consider deactivating instead.' 
      });
    }
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, validity_days } = req.body;
    
    // Validate input
    if (!name || !category || !price || !description || !validity_days) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if product exists
    const checkProduct = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const result = await pool.query(
      `UPDATE products 
       SET name = $1, category = $2, price = $3, description = $4, validity_days = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [name, category, price, description, validity_days, id]
    );
    
    res.json({ 
      message: 'Product updated successfully', 
      product: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const checkProduct = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product has transactions
    const checkResult = await pool.query(
      'SELECT COUNT(*) as count FROM transactions WHERE product_id = $1',
      [id]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product with existing transactions. Consider deactivating instead.' 
      });
    }
    
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        t.id,
        t.transaction_date,
        u.username,
        u.email,
        p.name as product_name,
        p.category,
        t.amount
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN products p ON t.product_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    query += ' ORDER BY t.transaction_date DESC';
    
    const result = await pool.query(query, params);
    
    // Calculate summary
    const totalRevenue = result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const totalTransactions = result.rows.length;
    
    // Calculate by category
    const categoryStats = result.rows.reduce((acc, row) => {
      if (!acc[row.category]) {
        acc[row.category] = { count: 0, revenue: 0 };
      }
      acc[row.category].count++;
      acc[row.category].revenue += parseFloat(row.amount);
      return acc;
    }, {});
    
    res.json({
      summary: {
        totalRevenue,
        totalTransactions,
        startDate: startDate || null,
        endDate: endDate || null,
        categoryStats
      },
      transactions: result.rows
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};