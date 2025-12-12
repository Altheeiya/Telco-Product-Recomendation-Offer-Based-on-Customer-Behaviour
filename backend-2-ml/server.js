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
// HELPER FUNCTIONS - FIXED VERSION
// ============================================

// 🆕 DYNAMIC MAPPING - Fetch products dan match otomatis
async function mapToProductIdDynamic(offerName, allProducts) {
    if (!offerName) {
        console.log('⚠️ No offer name provided, using first product');
        return allProducts[0]?.id || 1;
    }
    
    const lower = offerName.toLowerCase().trim();
    console.log(`\n🔍 Mapping offer: "${offerName}"`);
    console.log(`   Lowercase: "${lower}"`);
    
    // 1. EXACT NAME MATCH
    const exactMatch = allProducts.find(p => 
        p.name.toLowerCase().trim() === lower
    );
    if (exactMatch) {
        console.log(`✅ EXACT match found: "${exactMatch.name}" (ID: ${exactMatch.id})`);
        return exactMatch.id;
    }
    
    // 2. PARTIAL NAME MATCH (offer includes product name)
    const partialMatch = allProducts.find(p => {
        const productName = p.name.toLowerCase();
        return lower.includes(productName) || productName.includes(lower);
    });
    if (partialMatch) {
        console.log(`✅ PARTIAL match found: "${partialMatch.name}" (ID: ${partialMatch.id})`);
        return partialMatch.id;
    }
    
    // 3. KEYWORD-BASED MAPPING
    const keywordMapping = {
        'data': ['data', 'internet', 'kuota', 'booster', 'gb', 'streaming'],
        'device': ['device', 'upgrade', 'hp', 'handphone', 'phone', 'tukar'],
        'family': ['family', 'keluarga', 'share', 'berbagi'],
        'general': ['general', 'hemat', 'paket', 'mix'],
        'retention': ['retention', 'loyal', 'setia', 'special', 'spesial'],
        'roaming': ['roaming', 'travel', 'luar negeri', 'international', 'pass'],
        'streaming': ['streaming', 'video', 'netflix', 'youtube', 'nonton', 'partner'],
        'topup': ['top-up', 'topup', 'isi ulang', 'pulsa', 'promo', 'bonus'],
        'voice': ['voice', 'call', 'nelpon', 'telepon', 'talktime', 'sms', 'bundle'],
    };
    
    // Check each product's category and name against keywords
    for (const product of allProducts) {
        const productLower = product.name.toLowerCase();
        const categoryLower = product.category?.toLowerCase() || '';
        
        for (const [type, keywords] of Object.entries(keywordMapping)) {
            const hasKeyword = keywords.some(keyword => 
                lower.includes(keyword) || 
                productLower.includes(keyword) ||
                categoryLower.includes(keyword)
            );
            
            if (hasKeyword) {
                // Check if product also matches this keyword type
                const productMatches = keywords.some(keyword =>
                    productLower.includes(keyword)
                );
                
                if (productMatches) {
                    console.log(`✅ KEYWORD match: "${product.name}" (ID: ${product.id}) via "${type}"`);
                    return product.id;
                }
            }
        }
    }
    
    // 4. CATEGORY MATCH
    const categoryMatch = allProducts.find(p => {
        const cat = p.category?.toLowerCase() || '';
        return cat && (lower.includes(cat) || cat.includes(lower));
    });
    if (categoryMatch) {
        console.log(`✅ CATEGORY match: "${categoryMatch.name}" (ID: ${categoryMatch.id})`);
        return categoryMatch.id;
    }
    
    // 5. ULTIMATE FALLBACK - Return first product
    console.log(`⚠️ No match found for "${offerName}", using fallback: "${allProducts[0]?.name}" (ID: ${allProducts[0]?.id})`);
    return allProducts[0]?.id || 1;
}

// Generate reason untuk rekomendasi
function generateReason(offerName, customerData) {
    const reasons = [];
    const lower = offerName.toLowerCase();

    // Data usage patterns
    if (customerData.avg_data_usage_gb > 5) {
        reasons.push('Penggunaan data Anda tinggi (>5GB/bulan)');
    } else if (customerData.avg_data_usage_gb > 2) {
        reasons.push('Penggunaan data Anda sedang');
    }

    // Video streaming
    if (customerData.pct_video_usage > 0.6) {
        reasons.push('Anda sering streaming video');
    } else if (customerData.pct_video_usage > 0.3) {
        reasons.push('Anda kadang streaming video');
    }

    // Call patterns
    if (customerData.avg_call_duration > 20) {
        reasons.push('Durasi telepon Anda tinggi');
    } else if (customerData.avg_call_duration > 10) {
        reasons.push('Anda cukup sering menelepon');
    }

    // Plan type
    if (customerData.plan_type === 'Postpaid') {
        reasons.push('Cocok untuk pengguna postpaid');
    } else {
        reasons.push('Cocok untuk pengguna prepaid');
    }

    // Spending
    if (customerData.monthly_spend > 150000) {
        reasons.push('Sesuai dengan budget premium Anda');
    } else if (customerData.monthly_spend > 100000) {
        reasons.push('Sesuai dengan budget bulanan Anda');
    } else {
        reasons.push('Paket hemat sesuai budget Anda');
    }

    // Travel
    if (customerData.travel_score > 0.5) {
        reasons.push('Cocok untuk yang sering bepergian');
    }

    // Loyalty
    if (customerData.complaint_count === 0) {
        reasons.push('Penawaran untuk pelanggan loyal');
    }

    // Top-up frequency
    if (customerData.topup_freq > 4) {
        reasons.push('Hemat biaya top-up bulanan');
    }

    // Default reason
    if (reasons.length === 0) {
        reasons.push('Berdasarkan analisis perilaku penggunaan Anda');
    }

    return reasons.slice(0, 3).join('. ') + '.';
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
        service: 'Telco ML Backend (FIXED VERSION)',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        models: { loaded: true },
        backend1: BACKEND1_URL
    });
});

// ============================================
// ENDPOINT: PREDICT (SINGLE) - UPDATED
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

        pyshell.on('close', async () => {
            if (!outputData) {
                return res.status(500).json({ status: 'error', message: 'No output from Python' });
            }

            let result = JSON.parse(outputData);

            // 🆕 Fetch products for dynamic mapping
            try {
                const productsResponse = await axios.get(`${BACKEND1_URL}/api/products`);
                const allProducts = productsResponse.data.data || productsResponse.data;
                
                console.log(`\n📦 Fetched ${allProducts.length} products from database`);

                // Map each recommendation to actual product
                result.prediction.recommendations = await Promise.all(
                    result.prediction.recommendations.map(async (rec) => {
                        const productId = await mapToProductIdDynamic(rec.offer, allProducts);
                        const product = allProducts.find(p => p.id === productId);
                        
                        return {
                            ...rec,
                            productId,
                            productName: product?.name || rec.offer,
                            reason: generateReason(rec.offer, customerData)
                        };
                    })
                );

            } catch (err) {
                console.error('⚠️ Could not fetch products, using fallback mapping:', err.message);
            }

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
// ENDPOINT: PREDICT & SAVE - FIXED VERSION
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

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🤖 GENERATING RECOMMENDATIONS FOR USER ${userId}`);
        console.log(`${'='.repeat(60)}\n`);

        // 🆕 STEP 1: Fetch all products from Backend 1
        console.log('📦 Step 1: Fetching products from Backend 1...');
        let allProducts = [];
        try {
            const productsResponse = await axios.get(`${BACKEND1_URL}/api/products`);
            allProducts = productsResponse.data.data || productsResponse.data;
            console.log(`✅ Fetched ${allProducts.length} products:`);
            allProducts.forEach(p => {
                console.log(`   - ID ${p.id}: ${p.name} (${p.category})`);
            });
        } catch (err) {
            console.error('❌ Failed to fetch products:', err.message);
            return res.status(503).json({
                status: 'error',
                message: 'Could not fetch products from Backend 1',
                hint: 'Make sure Backend 1 is running'
            });
        }

        // STEP 2: Run ML Prediction
        console.log('\n🧠 Step 2: Running ML prediction...');
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
            try {
                const parsed = JSON.parse(outputData);
                
                console.log('\n✅ ML Predictions received:');
                parsed.prediction.recommendations.forEach((rec, idx) => {
                    console.log(`   ${idx + 1}. ${rec.offer} (score: ${rec.score}%)`);
                });

                // STEP 3: Map predictions to actual products and save
                console.log('\n💾 Step 3: Mapping and saving recommendations...');
                const savedResults = [];

                for (const rec of parsed.prediction.recommendations) {
                    // 🆕 Use dynamic mapping
                    const productId = await mapToProductIdDynamic(rec.offer, allProducts);
                    const product = allProducts.find(p => p.id === productId);

                    console.log(`\n   Processing: ${rec.offer}`);
                    console.log(`   → Mapped to: ${product?.name} (ID: ${productId})`);

                    try {
                        const saveResponse = await axios.post(
                            `${BACKEND1_URL}/api/recommendations`,
                            {
                                userId,
                                productId,
                                score: rec.score / 100,
                                reason: generateReason(rec.offer, customerData)
                            },
                            { timeout: 5000 }
                        );

                        console.log(`   ✅ Saved successfully`);
                        savedResults.push({ 
                            offer: rec.offer,
                            mappedTo: product?.name,
                            productId,
                            score: rec.score,
                            saved: true 
                        });

                    } catch (err) {
                        console.error(`   ❌ Save failed:`, err.message);
                        savedResults.push({ 
                            offer: rec.offer,
                            mappedTo: product?.name,
                            productId,
                            score: rec.score,
                            saved: false, 
                            error: err.response?.data?.message || err.message 
                        });
                    }
                }

                console.log(`\n${'='.repeat(60)}`);
                console.log(`✅ COMPLETED: ${savedResults.filter(r => r.saved).length}/${savedResults.length} saved`);
                console.log(`${'='.repeat(60)}\n`);

                res.json({
                    status: 'success',
                    message: 'Prediction completed and saved',
                    data: {
                        totalPredictions: savedResults.length,
                        successfullySaved: savedResults.filter(r => r.saved).length,
                        results: savedResults
                    }
                });

            } catch (parseError) {
                console.error('❌ Failed to parse ML output:', parseError.message);
                console.error('Raw output:', outputData);
                res.status(500).json({
                    status: 'error',
                    message: 'Failed to process ML prediction',
                    details: parseError.message
                });
            }
        });

        pyshell.on('error', (err) => {
            console.error('❌ Python execution error:', err);
            res.status(500).json({
                status: 'error',
                message: 'ML prediction failed',
                details: err.message
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
// ROOT
// ============================================

app.get('/', (req, res) => {
    res.json({
        service: 'Telco ML Prediction Backend',
        version: '2.0.0 (FIXED)',
        status: 'running',
        features: [
            'Dynamic product mapping',
            'Improved offer matching',
            'Detailed logging'
        ]
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
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 ML Backend (FIXED) running on http://localhost:${PORT}`);
    console.log(`📡 Connected to Backend 1: ${BACKEND1_URL}`);
    console.log(`${'='.repeat(60)}\n`);
});