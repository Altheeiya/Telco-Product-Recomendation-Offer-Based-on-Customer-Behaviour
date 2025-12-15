'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate 20 dummy transactions
    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const transactionDate = new Date(now);
      transactionDate.setDate(transactionDate.getDate() - daysAgo);

      transactions.push({
        userId: 1, // Assuming admin user ID = 1
        productId: Math.floor(Math.random() * 9) + 1, // Random product 1-9
        amount: [25000, 50000, 75000, 100000, 120000][Math.floor(Math.random() * 5)],
        transaction_date: transactionDate,
        createdAt: transactionDate,
        updatedAt: transactionDate
      });
    }

    await queryInterface.bulkInsert('Transactions', transactions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Transactions', null, {});
  }
};