const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Import model User yang sudah kita buat
const { validationResult } = require('express-validator');

// Kunci rahasia untuk tanda tangan token (Simpan di .env nanti!)
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara_api';

// 1. REGISTRASI USER BARU
exports.register = async (req, res) => {
    // Cek apakah ada error validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah digunakan' });
        }

        // Enkripsi Password (Hashing)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Simpan ke Database
        const newUser = await User.create({
            username,
            email,
            password_hash: passwordHash,
            role: 'user' // Default role
        });

        res.status(201).json({
            message: 'Registrasi berhasil',
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Email atau password salah' });
        }

        // Cek kecocokan password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah' });
        }

        // Buat Token (Tiket Masuk)
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1d' } // Token berlaku 1 hari
        );

        res.json({
            message: 'Login berhasil',
            token: token, // Ini yang akan disimpan Frontend
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};