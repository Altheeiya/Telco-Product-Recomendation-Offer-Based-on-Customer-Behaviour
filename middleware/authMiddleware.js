const jwt = require('jsonwebtoken');

// Fungsi untuk memproteksi route
module.exports = (req, res, next) => {
    // 1. Ambil token dari Header (Format: "Bearer <token>")
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Akses ditolak! Token tidak ditemukan.' });
    }

    // Ambil tokennya saja (buang kata 'Bearer ')
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verifikasi Token
        // Pastikan JWT_SECRET di .env sama dengan saat login
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_negara_api');
        
        // 3. Simpan data user ke dalam request object agar bisa dipakai di Controller
        req.user = decoded; 
        
        next(); // Lanjut ke controller
    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid.' });
    }
};