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

function generateReason(offerName, customerData) {
    const reasons = [];
    
    if (offerName.toLowerCase().includes('data') || offerName.toLowerCase().includes('internet')) {
        if (customerData.avg_data_usage_gb > 3) {
            reasons.push('Penggunaan data Anda tinggi');
        }
        if (customerData.pct_video_usage > 0.5) {
            reasons.push('Anda sering streaming video');
        }
    }
    
    if (offerName.toLowerCase().includes('call') || offerName.toLowerCase().includes('voice')) {
        if (customerData.avg_call_duration > 10) {
            reasons.push('Durasi telepon Anda tinggi');
        }
    }
    
    if (customerData.plan_type === 'Postpaid') {
        reasons.push('Cocok untuk pengguna postpaid');
    } else if (customerData.plan_type === 'Prepaid') {
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

function mapToProductId(offerName) {
    const mapping = {
        'Internet Hemat 10GB': 1,
        'Nelpon Sepuasnya': 2,
        'Combo Sakti': 3,
        'General Offer': 4
    };
    
    return mapping[offerName] || null;
}

function validateCustomerData(data) {
    const required = [
        'plan_type',
        'device_brand',
        'avg_data_usage_gb',
        'pct_video_usage',
        'avg_call_duration',
        'sms_freq',
        'monthly_spend',
        'topup_freq',
        'travel_score',
        'complaint_count'
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
        models: {
            loaded: fs.existsSync(MODEL_PATH) && fs.existsSync(SCALER_PATH) && fs.existsSync(ENCODER_PATH)
        }
    });
});

// ============================================
// ENDPOINT: PREDICT (SINGLE)
// ============================================

app.post('/api/predict', async (req, res) => {
    try {
        const customerData = req.body;
        
        // Validasi input
        const validation = validateCustomerData(customerData);
        if (!validation.valid) {
            return res.status(400).json({
                status: 'error',
                message: validation.message
            });
        }
        
        console.log('📊 Processing prediction for customer...');
        
        // Setup Python Shell dengan class-based API
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
        
        // Timeout 30 detik
        const timeout = setTimeout(() => {
            try {
                pyshell.terminate();
            } catch (e) {}
            console.error('❌ Python process timeout');
            return res.status(504).json({
                status: 'error',
                message: 'Prediction timeout (30s)'
            });
        }, 30000);
        
        let outputData = '';
        
        pyshell.on('message', (msg) => {
            outputData += msg;
        });
        
        pyshell.on('error', (err) => {
            clearTimeout(timeout);
            console.error('❌ Python error:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Prediction failed',
                error: err.message
            });
        });
        
        pyshell.on('close', () => {
            clearTimeout(timeout);
            
            if (!outputData) {
                return res.status(500).json({
                    status: 'error',
                    message: 'No output from Python'
                });
            }
            
            let result;
            try {
                result = JSON.parse(outputData);
            } catch (e) {
                console.error('❌ JSON parse error:', e);
                return res.status(500).json({
                    status: 'error',
                    message: 'Invalid JSON from Python',
                    raw: outputData
                });
            }
            
            if (result.status === 'error') {
                return res.status(500).json(result);
            }
            
            // Enrich dengan reason dan productId
            result.prediction.recommendations = result.prediction.recommendations.map(rec => ({
                ...rec,
                reason: generateReason(rec.offer, customerData),
                productId: mapToProductId(rec.offer)
            }));
            
            console.log('✅ Prediction successful:', result.prediction.primary_offer);
            
            res.json({
                status: 'success',
                message: 'Prediction completed',
                data: result,
                timestamp: new Date().toISOString()
            });
        });
        
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// ============================================
// ENDPOINT: PREDICT & SAVE TO BACKEND 1
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
        
        const validation = validateCustomerData(customerData);
        if (!validation.valid) {
            return res.status(400).json({
                status: 'error',
                message: validation.message
            });
        }
        
        console.log(`📊 Processing prediction for userId: ${userId}...`);
        
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
        
        const timeout = setTimeout(() => {
            try {
                pyshell.terminate();
            } catch (e) {}
            console.error('❌ Python process timeout');
            return res.status(504).json({
                status: 'error',
                message: 'Prediction timeout (30s)'
            });
        }, 30000);
        
        let outputData = '';
        
        pyshell.on('message', (msg) => {
            outputData += msg;
        });
        
        pyshell.on('error', (err) => {
            clearTimeout(timeout);
            console.error('❌ Python error:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Prediction failed',
                error: err.message
            });
        });
        
        pyshell.on('close', async () => {
            clearTimeout(timeout);
            
            if (!outputData) {
                return res.status(500).json({
                    status: 'error',
                    message: 'No output from Python'
                });
            }
            
            let prediction;
            try {
                prediction = JSON.parse(outputData);
            } catch (e) {
                console.error('❌ JSON parse error:', e);
                return res.status(500).json({
                    status: 'error',
                    message: 'Invalid JSON from Python',
                    raw: outputData
                });
            }
            
            if (prediction.status === 'error') {
                return res.status(500).json(prediction);
            }
            
            // Save ke Backend 1
            console.log('💾 Saving recommendations to Backend 1...');
            const savedResults = [];
            
            for (const rec of prediction.prediction.recommendations) {
                try {
                    const saveResponse = await axios.post(
                        `${BACKEND1_URL}/api/recommendations`,
                        {
                            userId: userId,
                            productId: mapToProductId(rec.offer),
                            score: rec.score / 100,
                            reason: generateReason(rec.offer, customerData)
                        },
                        { timeout: 5000 }
                    );
                    
                    savedResults.push({
                        offer: rec.offer,
                        saved: true,
                        id: saveResponse.data.data?.id
                    });
                    
                } catch (saveErr) {
                    console.error(`❌ Failed to save ${rec.offer}:`, saveErr.message);
                    savedResults.push({
                        offer: rec.offer,
                        saved: false,
                        error: saveErr.message
                    });
                }
            }
            
            console.log(`✅ Saved ${savedResults.filter(r => r.saved).length}/${savedResults.length} recommendations`);
            
            res.json({
                status: 'success',
                message: 'Prediction completed and saved',
                data: {
                    prediction: prediction,
                    saved: {
                        total: savedResults.length,
                        successful: savedResults.filter(r => r.saved).length,
                        failed: savedResults.filter(r => !r.saved).length,
                        details: savedResults
                    }
                },
                timestamp: new Date().toISOString()
            });
        });
        
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// ============================================
// ROOT ENDPOINT
// ============================================

app.get('/', (req, res) => {
    res.json({
        service: 'Telco ML Prediction Backend',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: 'GET /health',
            predict: 'POST /api/predict',
            predictAndSave: 'POST /api/predict-save'
        }
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
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 TELCO ML BACKEND STARTED         ║
╠════════════════════════════════════════╣
║   Environment: ${process.env.NODE_ENV || 'development'}
║   Port: ${PORT}
║   URL: http://localhost:${PORT}
║   Backend 1: ${BACKEND1_URL}
║   Python: ${PYTHON_PATH}
╚════════════════════════════════════════╝

✅ Server is ready to accept requests!

📌 Test endpoints:
   curl http://localhost:${PORT}/health
   curl -X POST http://localhost:${PORT}/api/predict -H "Content-Type: application/json" -d @test-data.json
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⚠️  SIGINT received, shutting down gracefully...');
    process.exit(0);
});