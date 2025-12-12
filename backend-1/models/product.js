'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Satu Product bisa ada di banyak Transaksi
      Product.hasMany(models.Transaction, { 
        foreignKey: 'productId',
        as: 'transactions'
      });
      
      // Satu Product bisa ada di banyak Rekomendasi
      Product.hasMany(models.Recommendation, { 
        foreignKey: 'productId',
        as: 'recommendations'
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    validity_days: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};