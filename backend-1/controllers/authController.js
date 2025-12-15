const { User, UserBehavior, Recommendation } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const axios = require('axios');

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara_api_super_secret_2024'; 

const signToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' });
};

// =====================
// 1. REGISTER USER
// =====================
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah digunakan' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password_hash: passwordHash,
            role: 'user'
        });

        // Buat data behavior
        // DATA HISTORIS (Random) - Simulasi kebiasaan dari provider lama
        // DATA REAL-TIME (Reset) - Mulai dari nol di aplikasi ini
        const behavior = await UserBehavior.create({
            userId: newUser.id,
            plan_type: Math.random() > 0.5 ? 'Postpaid' : 'Prepaid',
            device_brand: ['Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'iPhone'][Math.floor(Math.random() * 5)],
            
            // Histori pemakaian (tetap di-generate agar ML punya data awal)
            avg_data_usage_gb: parseFloat((Math.random() * 20).toFixed(1)), 
            pct_video_usage: parseFloat(Math.random().toFixed(2)),
            avg_call_duration: parseFloat((Math.random() * 100).toFixed(1)),
            sms_freq: Math.floor(Math.random() * 20),
            gaming_usage: parseFloat((Math.random() * 20).toFixed(1)),
            travel_score: parseFloat(Math.random().toFixed(2)),
            complaint_count: 0, 

            // State User Baru (Bersih)
            monthly_spend: 0,      // Belum belanja
            topup_freq: 0,         // Belum topup
            balance: 100000,       // MODAL AWAL 100rb (Supaya bisa tes beli paket)
            data_remaining_gb: 0,  // Belum punya kuota
            roaming_usage: false
        });

        // ⭐ TRIGGER ML GENERATION (Akan menghasilkan rekomendasi default/cold-start)
        triggerMLGeneration(newUser.id, behavior);

        const token = signToken(newUser.id, newUser.role);

        res.status(201).json({
            message: 'Registrasi berhasil',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ⭐ FUNGSI: Trigger ML & Save to DB
async function triggerMLGeneration(userId, behavior) {
    try {
        console.log(`🤖 [Background] Starting ML generation for user ${userId}`);
        
        const customerData = {
            plan_type: behavior.plan_type,
            device_brand: behavior.device_brand,
            avg_data_usage_gb: behavior.avg_data_usage_gb,
            pct_video_usage: behavior.pct_video_usage,
            avg_call_duration: behavior.avg_call_duration,
            sms_freq: behavior.sms_freq,
            monthly_spend: behavior.monthly_spend,
            topup_freq: behavior.topup_freq,
            travel_score: behavior.travel_score,
            complaint_count: behavior.complaint_count
        };

        const mlResponse = await axios.post(
            `${ML_BACKEND_URL}/api/predict`,
            customerData,
            { timeout: 30000 }
        );

        if (mlResponse.data.status === 'success') {
            const resultData = mlResponse.data.data;
            
            if (resultData.prediction && resultData.prediction.recommendations) {
                 const recsToSave = resultData.prediction.recommendations.map(rec => ({
                    userId: userId,
                    productId: rec.productId,
                    score: rec.score,
                    reason: rec.reason
                }));

                if (recsToSave.length > 0) {
                    await Recommendation.bulkCreate(recsToSave);
                    console.log(`✅ [Background] Saved ${recsToSave.length} ML recommendations for user ${userId}`);
                }
            }
        }
    } catch (error) {
        console.error(`❌ [Background] ML generation failed for user ${userId}:`, error.message);
    }
}

// =====================
// 2. LOGIN USER
// =====================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: UserBehavior, as: 'behavior' }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Email atau password salah' });
        }

        if (!user.password_hash) {
            return res.status(400).json({
                message: 'Akun ini rusak (password kosong). Silakan register ulang.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah' });
        }

        const token = signToken(user.id, user.role);

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                behavior: user.behavior
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};