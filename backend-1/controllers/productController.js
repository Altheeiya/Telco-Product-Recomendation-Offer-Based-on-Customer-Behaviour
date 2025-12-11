const { Product } = require('../models');

// 1. GET ALL: Mengambil semua data produk (Untuk list di dashboard)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json({
            status: 'success',
            data: products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET DETAIL: Mengambil 1 produk berdasarkan ID (Untuk detail paket)
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        res.json({
            status: 'success',
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. CREATE: Menambah produk baru (Opsional: Untuk admin/testing)
exports.createProduct = async (req, res) => {
    try {
        const { name, category, price, description, validity_days } = req.body;
        
        const newProduct = await Product.create({
            name,
            category,
            price,
            description,
            validity_days
        });

        res.status(201).json({
            status: 'success',
            data: newProduct
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};