const { User, UserBehavior } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara_api';

const signToken = id => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' });
};

// =====================
// 1. REGISTRASI USER
// =====================
exports.register = async (req, res) => {
    // Cek error validasi
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Cek email duplikat
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah digunakan' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Buat user
        const newUser = await User.create({
            username,
            email,
            password_hash: passwordHash,
            role: 'user'
        });

        // Buat data behavior dummy
        await UserBehavior.create({
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

            // Data dashboard
            balance: Math.floor(Math.random() * 50000),
            data_remaining_gb: parseFloat((Math.random() * 10).toFixed(1)),
            gaming_usage: parseFloat((Math.random() * 50).toFixed(1)),
            roaming_usage: Math.random() < 0.2
        });

        const token = signToken(newUser.id);

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

        const token = signToken(user.id);

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
