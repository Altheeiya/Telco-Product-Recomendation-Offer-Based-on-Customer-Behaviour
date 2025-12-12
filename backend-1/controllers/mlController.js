const axios = require('axios');
const { Recommendation, UserBehavior } = require('../models'); // <--- TAMBAH UserBehavior

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:5001';

exports.generateRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`🤖 Generating ML prediction for userId: ${userId}`);

        // 1. [BARU] Ambil Data Kebiasaan User dari Database
        // Kita tidak lagi pakai req.body dari frontend!
        const behavior = await UserBehavior.findOne({ where: { userId } });

        if (!behavior) {
            return res.status(404).json({
                status: 'error',
                message: 'Data penggunaan user tidak ditemukan. Silakan hubungi CS.'
            });
        }

        // 2. Siapkan Data untuk dikirim ke Python ML
        // Format JSON ini HARUS SAMA PERSIS dengan yang diminta predict.py
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

        // 3. Hapus Rekomendasi Lama (Supaya tidak double)
        console.log(`🧹 Clearing old recommendations...`);
        await Recommendation.destroy({ where: { userId } });

        // 4. Panggil Backend ML (Sama seperti sebelumnya)
        console.log(`📡 Calling ML Backend with DB Data...`);
        
        const mlResponse = await axios.post(
            `${ML_BACKEND_URL}/api/predict-save`,
            { userId, customerData },
            { 
                timeout: 35000,
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (mlResponse.data.status === 'success') {
            res.json({
                status: 'success',
                message: 'Recommendations generated based on your usage history',
                data: mlResponse.data.data
            });
        } else {
            throw new Error('ML prediction failed');
        }

    } catch (error) {
        console.error('❌ ML Controller Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                status: 'error',
                message: 'ML service is not available'
            });
        }

        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// ... (Function checkMLHealth biarkan saja, tidak perlu diubah)
exports.checkMLHealth = async (req, res) => {
    try {
        const response = await axios.get(`${ML_BACKEND_URL}/health`, { timeout: 5000 });
        res.json({ status: 'success', message: 'ML service is healthy' });
    } catch (error) {
        res.status(503).json({ status: 'error', message: 'ML service is not available' });
    }
};