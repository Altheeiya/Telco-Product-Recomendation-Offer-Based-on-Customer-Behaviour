'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserBehaviors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        // Tambahkan references agar relasi ke tabel Users jelas (Opsional tapi Good Practice)
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      plan_type: {
        type: Sequelize.STRING
      },
      device_brand: {
        type: Sequelize.STRING
      },
      avg_data_usage_gb: {
        type: Sequelize.FLOAT
      },
      pct_video_usage: {
        type: Sequelize.FLOAT
      },
      avg_call_duration: {
        type: Sequelize.FLOAT
      },
      sms_freq: {
        type: Sequelize.INTEGER
      },
      monthly_spend: {
        type: Sequelize.FLOAT
      },
      topup_freq: {
        type: Sequelize.INTEGER
      },
      travel_score: {
        type: Sequelize.FLOAT
      },
      complaint_count: {
        type: Sequelize.INTEGER
      },
      balance: {
        type: Sequelize.INTEGER
      },
      data_remaining_gb: {
        type: Sequelize.FLOAT
      },
      
      // --- MULAI TAMBAHAN WAJIB DI SINI ---
      gaming_usage: {
        type: Sequelize.FLOAT
      },
      roaming_usage: {
        type: Sequelize.BOOLEAN
      },
      // --- SELESAI TAMBAHAN ---

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserBehaviors');
  }
};