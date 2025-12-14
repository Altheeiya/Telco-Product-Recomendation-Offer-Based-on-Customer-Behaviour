'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Products', [
      {
        name: 'Data Booster',
        category: 'Data',
        price: 25000,
        description: 'Kuota ekstra 5GB untuk internetan makin puas',
        validity_days: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Device Upgrade Offer',
        category: 'Device',
        price: 0,
        description: 'Voucher diskon tukar tambah HP baru s/d 1 Juta',
        validity_days: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Family Plan Offer',
        category: 'Plan',
        price: 150000,
        description: 'Kuota 50GB + Nelpon Unlimited (Share 4 Anggota)',
        validity_days: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'General Offer',
        category: 'Mix',
        price: 50000,
        description: 'Paket Hemat: Internet 10GB + 50 Menit All Op',
        validity_days: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Retention Offer',
        category: 'Special',
        price: 10000,
        description: 'Penawaran Spesial Pelanggan Setia: Kuota 20GB',
        validity_days: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Roaming Pass',
        category: 'Roaming',
        price: 100000,
        description: 'Paket Internet Roaming 7 Hari (Asia Pasifik)',
        validity_days: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Streaming Partner Pack',
        category: 'Data',
        price: 30000,
        description: 'Kuota Nonton 15GB (Netflix, YouTube, Vidio)',
        validity_days: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Top-up Promo',
        category: 'Promo',
        price: 50000,
        description: 'Bonus pulsa 10% dan poin ganda setiap isi ulang',
        validity_days: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Voice Bundle',
        category: 'Talktime',
        price: 20000,
        description: 'Nelpon 200 Menit ke Semua Operator + 100 SMS',
        validity_days: 14,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Products', null, {});
  }
};
