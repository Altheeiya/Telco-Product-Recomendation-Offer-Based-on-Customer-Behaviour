const { Transaction, Product, User, UserBehavior, Recommendation } = require('../models');
const axios = require('axios');

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:5001';

// CREATE: User Membeli Paket
exports.createTransaction = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { productId } = req.body;

        // 1. Cek Produk
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        // 2. Cek Saldo User
        const behavior = await UserBehavior.findOne({ where: { userId } });
        if (!behavior) {
            return res.status(404).json({ message: 'Data behavior user tidak ditemukan' });
        }

        // Pastikan saldo cukup
        if (parseFloat(behavior.balance) < parseFloat(product.price)) {
            return res.status(400).json({ message: 'Pulsa tidak mencukupi. Silakan isi ulang.' });
        }

        // 3. Simpan Transaksi
        const newTransaction = await Transaction.create({
            userId: userId,
            productId: productId,
            amount: product.price,
            transaction_date: new Date()
        });

        // ⭐ 4. UPDATE USER BEHAVIOR (LOGIKA DIPERBAIKI)
        
        // A. Update monthly_spend
        const currentSpend = parseFloat(behavior.monthly_spend || 0);
        const newMonthlySpend = currentSpend + parseFloat(product.price);
        
        // B. Update topup_freq
        const newTopupFreq = parseInt(behavior.topup_freq || 0) + 1;
        
        // C. Update balance (Kurangi saldo)
        const currentBalance = parseFloat(behavior.balance || 0);
        const newBalance = Math.max(0, currentBalance - parseFloat(product.price));

        // D. Update Data Usage & Remaining Quota
        let newDataUsage = parseFloat(behavior.avg_data_usage_gb || 0);
        let newDataRemaining = parseFloat(behavior.data_remaining_gb || 0);
        
        // Ekstrak GB dari nama produk (contoh: "Internet 15GB")
        const gbMatch = product.name.match(/(\d+)\s*(GB|gb|Gb)/i);
        
        if (gbMatch) {
            const addedGB = parseInt(gbMatch[1]);
            
            // TAMBAH Kuota Langsung (Accumulate)
            newDataRemaining = newDataRemaining + addedGB; 
            
            // Update Rata-rata Usage
            const currentTopups = parseInt(behavior.topup_freq || 0);
            if (currentTopups === 0) {
                newDataUsage = addedGB; // Pembelian pertama
            } else {
                newDataUsage = ((newDataUsage * currentTopups) + addedGB) / (currentTopups + 1);
            }
        }
        
        await behavior.update({
            monthly_spend: newMonthlySpend,
            topup_freq: newTopupFreq,
            avg_data_usage_gb: parseFloat(newDataUsage.toFixed(1)),
            balance: newBalance,
            data_remaining_gb: parseFloat(newDataRemaining.toFixed(1))
        });

        console.log(`✅ Transaction Success: User ${userId} bought ${product.name}. Quota now: ${newDataRemaining}GB`);

        // ⭐ 5. TRIGGER AI REGENERATION (Background)
        triggerMLRegeneration(userId, behavior);

        res.status(201).json({
            status: 'success',
            message: 'Pembelian berhasil! Kuota bertambah & AI sedang memperbarui rekomendasi.',
            data: newTransaction
        });

    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ⭐ FUNGSI BACKGROUND: Regenerate ML Recommendations
async function triggerMLRegeneration(userId, behavior) {
    try {
        console.log(`🤖 [Background] Regenerating ML for user ${userId}`);
        
        // Refresh data terbaru dari DB
        const latestBehavior = await UserBehavior.findOne({ where: { userId } });
        
        const customerData = {
            plan_type: latestBehavior.plan_type,
            device_brand: latestBehavior.device_brand,
            avg_data_usage_gb: latestBehavior.avg_data_usage_gb,
            pct_video_usage: latestBehavior.pct_video_usage,
            avg_call_duration: latestBehavior.avg_call_duration,
            sms_freq: latestBehavior.sms_freq,
            monthly_spend: latestBehavior.monthly_spend,
            topup_freq: latestBehavior.topup_freq,
            travel_score: latestBehavior.travel_score,
            complaint_count: latestBehavior.complaint_count
        };

        const mlResponse = await axios.post(
            `${ML_BACKEND_URL}/api/predict`,
            customerData,
            { timeout: 30000 }
        );

        if (mlResponse.data.status === 'success') {
            const resultData = mlResponse.data.data;
            
            // Hapus rekomendasi lama
            await Recommendation.destroy({ where: { userId } });
            
            // Simpan rekomendasi baru
            if (resultData.prediction && resultData.prediction.recommendations) {
                const recsToSave = resultData.prediction.recommendations.map(rec => ({
                    userId: userId,
                    productId: rec.productId,
                    score: rec.score || 0.95,
                    reason: rec.reason || "AI-powered recommendation"
                }));

                if (recsToSave.length > 0) {
                    await Recommendation.bulkCreate(recsToSave);
                    console.log(`✅ Saved ${recsToSave.length} new recommendations for user ${userId}`);
                }
            }
        }
    } catch (error) {
        console.error(`❌ ML regeneration failed for user ${userId}:`, error.message);
    }
}

// READ: Lihat Riwayat Transaksi User
exports.getMyTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction.findAll({
            where: { userId: userId },
            include: [
                { model: Product, as: 'product' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            status: 'success',
            data: transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};