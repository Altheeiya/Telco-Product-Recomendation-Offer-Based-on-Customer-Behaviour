'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash password untuk admin
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // Insert admin user
    await queryInterface.bulkInsert('Users', [
      {
        username: 'Admin',
        email: 'admin@telco.com',
        password_hash: passwordHash,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Get admin user ID
    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE email = 'admin@telco.com' LIMIT 1;`
    );

    if (adminUser.length > 0) {
      const adminId = adminUser[0].id;

      // Insert dummy behavior for admin
      await queryInterface.bulkInsert('UserBehaviors', [
        {
          userId: adminId,
          plan_type: 'Postpaid',
          device_brand: 'iPhone',
          avg_data_usage_gb: 50.0,
          pct_video_usage: 0.8,
          avg_call_duration: 100.0,
          sms_freq: 50,
          monthly_spend: 500000,
          topup_freq: 1,
          travel_score: 0.9,
          complaint_count: 0,
          balance: 100000,
          data_remaining_gb: 50.0,
          gaming_usage: 0.0,
          roaming_usage: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@telco.com' }, {});
  }
};