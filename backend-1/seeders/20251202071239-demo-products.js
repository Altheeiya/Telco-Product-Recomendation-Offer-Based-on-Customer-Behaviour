'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Products', [
      {
        name: 'Internet Hemat 10GB',
        category: 'Data',
        price: 50000,
        description: 'Kuota 10GB masa aktif 30 hari',
        validity_days: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nelpon Sepuasnya',
        category: 'Talktime',
        price: 20000,
        description: 'Nelpon ke semua operator 100 menit',
        validity_days: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Combo Sakti',
        category: 'Mix',
        price: 75000,
        description: 'Internet 15GB + Nelpon 50 menit',
        validity_days: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Products', null, {});
  }
};