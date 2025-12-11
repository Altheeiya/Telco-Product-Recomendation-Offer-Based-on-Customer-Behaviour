const { Recommendation, Product } = require('../models');

// READ: Menampilkan Rekomendasi untuk User di Dashboard
exports.getMyRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        const recommendations = await Recommendation.findAll({
            where: { userId: userId },
            include: [
                { model: Product, as: 'product' } // Tampilkan produk apa yang direkomendasikan
            ],
            order: [['score', 'DESC']] // Tampilkan score tertinggi (paling cocok) duluan
        });

        res.json({
            status: 'success',
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE: Menyimpan Hasil Prediksi (Biasanya dipanggil oleh script ML/Backend 2)
exports.createRecommendation = async (req, res) => {
    try {
        // Disini kita terima userId dari body karena yang input adalah Sistem/Admin, bukan User sendiri
        const { userId, productId, score, reason } = req.body;

        const newRec = await Recommendation.create({
            userId,
            productId,
            score,
            reason
        });

        res.status(201).json({
            status: 'success',
            data: newRec
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};