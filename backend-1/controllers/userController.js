const { User, UserBehavior, Transaction } = require('../models');

// Menangani: (d) Get Sisa Pulsa/Kuota & (e) API Badge
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Dari token middleware

        // Ambil user + behavior (Sesuai relasi di file authController kamu: 'behavior')
        const user = await User.findByPk(userId, {
            include: [{ model: UserBehavior, as: 'behavior' }] 
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // HITUNG MANUAL DARI TRANSAKSI (Agar data real-time & bukan dummy)
        // Kita ambil semua transaksi user ini, lalu total jumlahnya
        const transactions = await Transaction.findAll({ where: { userId } });
        
        // Hitung total belanja (monthly_spend)
        const realSpend = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        // Hitung frekuensi topup
        const realTopupFreq = transactions.length;

        const behavior = user.behavior || {};

        // Override (timpa) nilai behavior dengan hasil kalkulasi real-time
        behavior.monthly_spend = realSpend;
        behavior.topup_freq = realTopupFreq;

        // LOGIKA BADGE (API e)
        // Aturan: > 150rb = Gold, > 50rb = Silver, sisanya Bronze
        let badge = "Bronze";
        if (behavior.monthly_spend > 150000) badge = "Gold";
        else if (behavior.monthly_spend > 50000) badge = "Silver";

        res.json({
            status: "success",
            data: {
                username: user.username,
                email: user.email,
                role: user.role,
                // API (d) Sisa Pulsa & Kuota
                balance: behavior.balance || 0,
                data_remaining_gb: behavior.data_remaining_gb || 0,
                // API (e) Badge & Spend
                badge_level: badge, 
                monthly_spend: behavior.monthly_spend, // Nilai ini sekarang murni dari transaksi
                topup_freq: behavior.topup_freq
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Menangani: (f) API Edit Profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email } = req.body;

        // Cek jika email baru sudah dipakai orang lain
        if (email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ message: "Email sudah digunakan user lain" });
            }
        }

        await User.update({ username, email }, { where: { id: userId } });

        res.json({ status: "success", message: "Profil berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.topUp = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;
        
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Nominal tidak valid" });
        }

        const user = await User.findByPk(userId, {
            include: [{ model: UserBehavior, as: 'behavior' }]
        });

        if (!user || !user.behavior) {
            return res.status(404).json({ message: "User behavior tidak ditemukan" });
        }

        // Update Balance
        const currentBalance = parseFloat(user.behavior.balance || 0);
        const newBalance = currentBalance + parseFloat(amount);

        await user.behavior.update({ balance: newBalance });

        res.json({ 
            status: "success", 
            message: "Top Up berhasil!",
            data: { balance: newBalance }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};