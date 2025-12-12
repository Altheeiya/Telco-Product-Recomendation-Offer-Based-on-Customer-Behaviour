'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Satu User bisa punya banyak Transaksi
      User.hasMany(models.Transaction, { 
        foreignKey: 'userId',
        as: 'transactions'
      });
      
      // Satu User bisa punya banyak Rekomendasi
      User.hasMany(models.Recommendation, { 
        foreignKey: 'userId',
        as: 'recommendations'
      });
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};