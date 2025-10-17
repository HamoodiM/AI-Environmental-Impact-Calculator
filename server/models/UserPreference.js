const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserPreference = sequelize.define('UserPreference', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  default_model: {
    type: DataTypes.STRING,
    defaultValue: 'default'
  },
  default_region: {
    type: DataTypes.STRING,
    defaultValue: 'global-average'
  },
  units_preference: {
    type: DataTypes.ENUM('metric', 'imperial'),
    defaultValue: 'metric'
  },
  notifications_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  email_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  weekly_reports: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  theme: {
    type: DataTypes.ENUM('light', 'dark', 'auto'),
    defaultValue: 'light'
  }
}, {
  tableName: 'user_preferences'
});

module.exports = UserPreference;
