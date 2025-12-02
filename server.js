const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Import koneksi database

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes'); // <-- BARU
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint Test
app.get('/', (req, res) => {
    res.send('API Telco Recommendation Berjalan!');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes); // <-- BARU
app.use('/api/recommendations', recommendationRoutes); // <-- BARU


// Jalankan Server & Cek Koneksi DB
app.listen(PORT, async () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    try {
        // Cek koneksi ke Laragon MySQL
        await sequelize.authenticate();
        console.log('Berhasil terhubung ke Database MySQL Laragon!');
    } catch (error) {
        console.error('Gagal koneksi ke database:', error);
    }
});