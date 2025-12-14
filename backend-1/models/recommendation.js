'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recommendation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Rekomendasi milik satu User
      Recommendation.belongsTo(models.User, { 
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Rekomendasi menyarankan satu Produk
      Recommendation.belongsTo(models.Product, { 
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }
  Recommendation.init({
    userId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    score: DataTypes.FLOAT,
    reason: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Recommendation',
  });
  return Recommendation;
};