require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

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

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// VALIDASI STARTUP
// ============================================

function validateModelFiles() {
    const files = [MODEL_PATH, SCALER_PATH, ENCODER_PATH];
    const missing = files.filter(file => !fs.existsSync(file));
    
    if (missing.length > 0) {
        console.error('❌ Missing model files:');
        missing.forEach(file => console.error(`   - ${file}`));
        console.error('\n⚠️  Please copy .pkl files from ML team to models/ folder');
        process.exit(1);
    }
    
    console.log('✅ All model files found');
}

validateModelFiles();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Reason untuk rekomendasi
function generateReason(offerName, customerData) {
    const reasons = [];
    
    const lower = offerName.toLowerCase();

    if (lower.includes('data') || lower.includes('internet')) {
        if (customerData.avg_data_usage_gb > 3) reasons.push('Penggunaan data Anda tinggi');
        if (customerData.pct_video_usage > 0.5) reasons.push('Anda sering streaming video');
    }

    if (lower.includes('nelpon') || lower.includes('call') || lower.includes('voice')) {
        if (customerData.avg_call_duration > 10) reasons.push('Durasi telepon Anda tinggi');
    }

    if (customerData.plan_type === 'Postpaid') {
        reasons.push('Cocok untuk pengguna postpaid');
    } else {
        reasons.push('Cocok untuk pengguna prepaid');
    }

    if (customerData.monthly_spend > 100000) {
        reasons.push('Sesuai dengan budget bulanan Anda');
    }

    if (customerData.travel_score > 0.5) {
        reasons.push('Cocok untuk yang sering bepergian');
    }

    if (reasons.length === 0) {
        reasons.push('Berdasarkan analisis perilaku penggunaan Anda');
    }

    return reasons.join('. ');
}

// =====================
// 🟩 FIX PALING PENTING!
// =====================
function mapToProductId(offerName) {
    if (!offerName) return 1; // fallback aman

    const lower = offerName.toLowerCase();

    // Exact mapping
    const mapping = {
        'internet hemat 10gb': 1,
        'nelpon sepuasnya': 2,
        'combo sakti': 3
    };

    if (mapping[lower]) return mapping[lower];

    // Partial mapping fallback
    if (lower.includes('internet') || lower.includes('data')) return 1;
    if (lower.includes('nelpon') || lower.includes('call') || lower.includes('voice')) return 2;
    if (lower.includes('combo')) return 3;

    // Ultimate fallback → tidak akan pernah mengirim ID yg tidak ada
    return 1;
}

function validateCustomerData(data) {
    const required = [
        'plan_type', 'device_brand', 'avg_data_usage_gb',
        'pct_video_usage', 'avg_call_duration', 'sms_freq',
        'monthly_spend', 'topup_freq', 'travel_score', 'complaint_count'
    ];
    
    const missing = required.filter(field => !(field in data));
    
    if (missing.length > 0) {
        return {
            valid: false,
            message: `Missing required fields: ${missing.join(', ')}`
        };
    }
    
    return { valid: true };
}

// ============================================
// ENDPOINT: HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Telco ML Backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        models: { loaded: true }
    });
});

// ============================================
// ENDPOINT: PREDICT (SINGLE)
// ============================================

app.post('/api/predict', async (req, res) => {
    try {
        const customerData = req.body;

        const validation = validateCustomerData(customerData);
        if (!validation.valid) {
            return res.status(400).json({ status: 'error', message: validation.message });
        }

        console.log('📊 Processing prediction...');

        const pyshell = new PythonShell('predict.py', {
            mode: 'text',
            pythonPath: PYTHON_PATH,
            scriptPath: path.join(__dirname, 'python'),
            args: [
                MODEL_PATH,
                SCALER_PATH,
                ENCODER_PATH,
                JSON.stringify(customerData)
            ]
        });

        let outputData = '';

        pyshell.on('message', (msg) => outputData += msg);

        pyshell.on('close', () => {
            if (!outputData) {
                return res.status(500).json({ status: 'error', message: 'No output from Python' });
            }

            let result = JSON.parse(outputData);

            result.prediction.recommendations = result.prediction.recommendations.map(rec => ({
                ...rec,
                reason: generateReason(rec.offer, customerData),
                productId: mapToProductId(rec.offer)
            }));

            res.json({
                status: 'success',
                message: 'Prediction completed',
                data: result
            });
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ============================================
// ENDPOINT: PREDICT & SAVE
// ============================================

app.post('/api/predict-save', async (req, res) => {
    try {
        const { userId, customerData } = req.body;

        if (!userId || !customerData) {
            return res.status(400).json({
                status: 'error',
                message: 'userId and customerData are required'
            });
        }

        console.log(`📊 Prediction for userId=${userId}`);

        const pyshell = new PythonShell('predict.py', {
            mode: 'text',
            pythonPath: PYTHON_PATH,
            scriptPath: path.join(__dirname, 'python'),
            args: [
                MODEL_PATH,
                SCALER_PATH,
                ENCODER_PATH,
                JSON.stringify(customerData)
            ]
        });

        let outputData = '';

        pyshell.on('message', (msg) => outputData += msg);

        pyshell.on('close', async () => {
            const parsed = JSON.parse(outputData);

            const savedResults = [];

            for (const rec of parsed.prediction.recommendations) {
                const productId = mapToProductId(rec.offer); // FIX

                try {
                    const saveResponse = await axios.post(
                        `${BACKEND1_URL}/api/recommendations`,
                        {
                            userId,
                            productId,
                            score: rec.score / 100,
                            reason: generateReason(rec.offer, customerData)
                        }
                    );

                    savedResults.push({ offer: rec.offer, saved: true });

                } catch (err) {
                    savedResults.push({ offer: rec.offer, saved: false, error: err.message });
                }
            }

            res.json({
                status: 'success',
                message: 'Prediction completed and saved',
                saved: savedResults
            });
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ============================================
// ROOT
// ============================================

app.get('/', (req, res) => {
    res.json({
        service: 'Telco ML Prediction Backend',
        version: '1.0.0',
        status: 'running'
    });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found',
        path: req.path
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ML Backend running on http://localhost:${PORT}`);
});
