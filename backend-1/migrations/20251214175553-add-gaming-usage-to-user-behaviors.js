'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cek apakah kolom sudah ada
    const tableInfo = await queryInterface.describeTable('UserBehaviors');
    
    // Tambahkan gaming_usage jika belum ada
    if (!tableInfo.gaming_usage) {
      await queryInterface.addColumn('UserBehaviors', 'gaming_usage', {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
      });
    }
    
    // Tambahkan roaming_usage jika belum ada
    if (!tableInfo.roaming_usage) {
      await queryInterface.addColumn('UserBehaviors', 'roaming_usage', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserBehaviors', 'gaming_usage');
    await queryInterface.removeColumn('UserBehaviors', 'roaming_usage');
  }
};