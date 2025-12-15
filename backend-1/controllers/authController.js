const { User, UserBehavior } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const axios = require('axios');

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Pastikan ini ada di env

// =====================
// HELPER: Sign Token
// =====================
// Revisi: Menambahkan parameter role ke dalam payload token
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

        // Buat data behavior dengan nilai realistis
        const behavior = await UserBehavior.create({
            userId: newUser.id,
            plan_type: Math.random() > 0.5 ? 'Postpaid' : 'Prepaid',
            device_brand: ['Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'iPhone'][Math.floor(Math.random() * 5)],
            avg_data_usage_gb: parseFloat((Math.random() * 50).toFixed(1)),
            pct_video_usage: parseFloat(Math.random().toFixed(2)),
            avg_call_duration: parseFloat((Math.random() * 100).toFixed(1)),
            sms_freq: Math.floor(Math.random() * 50),
            monthly_spend: Math.floor(Math.random() * 250000) + 50000,
            topup_freq: Math.floor(Math.random() * 5) + 1,
            travel_score: parseFloat(Math.random().toFixed(2)),
            complaint_count: Math.random() > 0.9 ? 1 : 0,
            balance: Math.floor(Math.random() * 50000),
            data_remaining_gb: parseFloat((Math.random() * 10).toFixed(1)),
            gaming_usage: parseFloat((Math.random() * 50).toFixed(1)),
            roaming_usage: Math.random() < 0.2
        });

        // ⭐ TRIGGER ML GENERATION (NON-BLOCKING)
        triggerMLGeneration(newUser.id, behavior);

        // Revisi: Menyertakan role saat generate token
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

// ⭐ FUNGSI BARU: Trigger ML (Non-blocking)
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
            `${ML_BACKEND_URL}/api/predict-save`,
            { userId, customerData },
            { timeout: 30000 }
        );

        if (mlResponse.data.status === 'success') {
            console.log(`✅ [Background] ML recommendations saved for user ${userId}`);
        }
    } catch (error) {
        console.error(`❌ [Background] ML generation failed for user ${userId}:`, error.message);
        // Tidak throw error karena non-blocking
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

        // Revisi: Menyertakan role saat generate token
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