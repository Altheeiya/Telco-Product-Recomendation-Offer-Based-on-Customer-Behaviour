const { User, UserBehavior } = require('../models');

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

        const behavior = user.behavior || {};

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
                // API (e) Badge
                badge_level: badge, 
                monthly_spend: behavior.monthly_spend
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