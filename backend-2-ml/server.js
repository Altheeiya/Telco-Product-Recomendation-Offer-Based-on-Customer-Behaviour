require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const db = require('./models'); // Sequelize models

// ============================================
// KONFIGURASI
// ============================================

const app = express();
const PORT = process.env.PORT || 5001;
const BACKEND1_URL = process.env.BACKEND1_URL || 'http://localhost:5000';
const PYTHON_PATH = process.env.PYTHON_PATH || 'python';

// Path ke model files
const MODEL_PATH = path.join(__dirname, 'models', 'telco_recommendation_model.pkl');
const SCALER_PATH = path.join(__dirname, 'models', 'scaler.pkl');
const ENCODER_PATH = path.join(__dirname, 'models', 'label_encoder.pkl');

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// VALIDASI MODEL (TIDAK MEMATIKAN SERVER)
// ============================================

function validateModelFiles() {
  const files = [MODEL_PATH, SCALER_PATH, ENCODER_PATH];
  const missing = files.filter(f => !fs.existsSync(f));

  if (missing.length > 0) {
    console.warn('⚠️ ML model belum lengkap, fitur ML dinonaktifkan');
    missing.forEach(f => console.warn(`   - ${f}`));
  } else {
    console.log('✅ Semua file ML tersedia');
  }
}

validateModelFiles();

// ============================================
// HELPER FUNCTIONS
// ============================================

async function mapToProductIdDynamic(offerName, allProducts) {
  if (!offerName) return allProducts[0]?.id || 1;

  const lower = offerName.toLowerCase();

  const exact = allProducts.find(p => p.name.toLowerCase() === lower);
  if (exact) return exact.id;

  const partial = allProducts.find(p =>
    lower.includes(p.name.toLowerCase()) ||
    p.name.toLowerCase().includes(lower)
  );
  if (partial) return partial.id;

  return allProducts[0]?.id || 1;
}

function generateReason(offerName, customerData) {
  const reasons = [];

  if (customerData.avg_data_usage_gb > 5) reasons.push('Penggunaan data tinggi');
  if (customerData.pct_video_usage > 0.5) reasons.push('Sering streaming video');
  if (customerData.monthly_spend > 150000) reasons.push('Sesuai budget premium');
  if (reasons.length === 0) reasons.push('Berdasarkan perilaku penggunaan');

  return reasons.slice(0, 3).join('. ') + '.';
}

function validateCustomerData(data) {
  const required = [
    'plan_type', 'device_brand', 'avg_data_usage_gb',
    'pct_video_usage', 'avg_call_duration', 'sms_freq',
    'monthly_spend', 'topup_freq', 'travel_score', 'complaint_count'
  ];

  const missing = required.filter(f => !(f in data));
  if (missing.length > 0) {
    return { valid: false, message: `Missing fields: ${missing.join(', ')}` };
  }
  return { valid: true };
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Telco Backend (API + ML)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: db.sequelize ? 'connected' : 'not connected',
    models: fs.existsSync(MODEL_PATH),
    backend1: BACKEND1_URL
  });
});

// ============================================
// ML PREDICT
// ============================================

app.post('/api/predict', async (req, res) => {
  const customerData = req.body;

  const validation = validateCustomerData(customerData);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  if (!fs.existsSync(MODEL_PATH)) {
    return res.status(503).json({ message: 'ML model not available' });
  }

  const pyshell = new PythonShell('predict.py', {
    mode: 'text',
    pythonPath: PYTHON_PATH,
    scriptPath: path.join(__dirname, 'python'),
    args: [MODEL_PATH, SCALER_PATH, ENCODER_PATH, JSON.stringify(customerData)]
  });

  let output = '';
  pyshell.on('message', msg => (output += msg));

  pyshell.on('close', async () => {
    const result = JSON.parse(output);

    try {
      const productsRes = await axios.get(`${BACKEND1_URL}/api/products`);
      const products = productsRes.data.data || productsRes.data;

      result.prediction.recommendations = await Promise.all(
        result.prediction.recommendations.map(async rec => {
          const productId = await mapToProductIdDynamic(rec.offer, products);
          const product = products.find(p => p.id === productId);
          return {
            ...rec,
            productId,
            productName: product?.name,
            reason: generateReason(rec.offer, customerData)
          };
        })
      );
    } catch (e) {
      console.warn('⚠️ Mapping produk gagal');
    }

    res.json({ status: 'success', data: result });
  });
});

// ============================================
// ROOT
// ============================================

app.get('/', (req, res) => {
  res.json({
    service: 'Telco Backend',
    version: 'FINAL',
    status: 'running',
    endpoints: [
      '/api/auth',
      '/api/products',
      '/api/transactions',
      '/api/admin',
      '/api/predict',
      '/health'
    ]
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ============================================
// START SERVER
// ============================================

db.sequelize
  .sync()
  .then(() => {
    console.log('✅ Database connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB error:', err.message);
    app.listen(PORT, () => {
      console.log(`⚠️ Server running without DB at http://localhost:${PORT}`);
    });
  });
