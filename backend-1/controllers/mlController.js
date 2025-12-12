const axios = require('axios');

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:5001';

exports.generateRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;
        const customerData = req.body;

        console.log(`🤖 Generating ML prediction for userId: ${userId}`);

        // Validasi input
        const requiredFields = [
            'plan_type', 'device_brand', 'avg_data_usage_gb',
            'pct_video_usage', 'avg_call_duration', 'sms_freq',
            'monthly_spend', 'topup_freq', 'travel_score', 'complaint_count'
        ];

        const missingFields = requiredFields.filter(field => !(field in customerData));
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Panggil Backend 2 ML
        console.log(`📡 Calling ML Backend at: ${ML_BACKEND_URL}/api/predict-save`);

        const mlResponse = await axios.post(
            `${ML_BACKEND_URL}/api/predict-save`,
            { userId, customerData },
            { 
                timeout: 35000,
                headers: { 'Content-Type': 'application/json' }
            }
        );

        console.log('✅ ML Response received:', mlResponse.data.status);

        if (mlResponse.data.status === 'success') {
            res.json({
                status: 'success',
                message: 'Recommendations generated and saved successfully',
                data: mlResponse.data.data
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'ML prediction failed',
                details: mlResponse.data
            });
        }

    } catch (error) {
        console.error('❌ ML Controller Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                status: 'error',
                message: 'ML service is not available',
                hint: `Trying to connect to: ${ML_BACKEND_URL}`
            });
        }

        if (error.response) {
            return res.status(error.response.status).json({
                status: 'error',
                message: error.response.data.message || 'ML service error',
                details: error.response.data
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to generate recommendations',
            error: error.message
        });
    }
};

exports.checkMLHealth = async (req, res) => {
    try {
        const response = await axios.get(`${ML_BACKEND_URL}/health`, { timeout: 5000 });
        
        res.json({
            status: 'success',
            message: 'ML service is healthy',
            mlService: response.data
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'ML service is not available',
            error: error.message
        });
    }
};