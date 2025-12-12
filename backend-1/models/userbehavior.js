'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserBehavior extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserBehavior.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  UserBehavior.init({
    userId: DataTypes.INTEGER,
    plan_type: DataTypes.STRING,
    device_brand: DataTypes.STRING,
    avg_data_usage_gb: DataTypes.FLOAT,
    pct_video_usage: DataTypes.FLOAT,
    avg_call_duration: DataTypes.FLOAT,
    sms_freq: DataTypes.INTEGER,
    monthly_spend: DataTypes.FLOAT,
    topup_freq: DataTypes.INTEGER,
    travel_score: DataTypes.FLOAT,
    complaint_count: DataTypes.INTEGER,
    balance: DataTypes.INTEGER,
    data_remaining_gb: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'UserBehavior',
  });
  return UserBehavior;
};