const { Transaction, Product, User } = require('../models');

// CREATE: User Membeli Paket
exports.createTransaction = async (req, res) => {
    try {
        // userId diambil otomatis dari Token (via middleware)
        const userId = req.user.id; 
        const { productId } = req.body; // Product apa yang dibeli?

        // 1. Cek apakah produk valid
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        // 2. Simpan Transaksi
        const newTransaction = await Transaction.create({
            userId: userId,
            productId: productId,
            amount: product.price, // Harga diambil dari database produk (lebih aman)
            transaction_date: new Date()
        });

        res.status(201).json({
            status: 'success',
            message: 'Pembelian berhasil!',
            data: newTransaction
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ: Lihat Riwayat Transaksi User yang Login
exports.getMyTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction.findAll({
            where: { userId: userId }, // Hanya ambil punya user ini
            include: [
                { model: Product, as: 'product' } // Sertakan detail produknya
            ],
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
        });

        res.json({
            status: 'success',
            data: transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};