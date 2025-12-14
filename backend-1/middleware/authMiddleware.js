const jwt = require('jsonwebtoken');

// ==============================
// Middleware: Proteksi Route
// ==============================
const authenticateToken = (req, res, next) => {
    // Ambil token dari Header: "Authorization: Bearer <token>"
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Akses ditolak! Token tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifikasi token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'rahasia_negara_api'
        );

        // Simpan data user (id, role, dll) ke request
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
    }
};

// ==============================
// Middleware: Admin Only
// ==============================
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Akses khusus admin.' });
};

module.exports = {
    authenticateToken,
    isAdmin
};
