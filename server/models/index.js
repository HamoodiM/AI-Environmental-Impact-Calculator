const sequelize = require('../config/sequelize');
const User = require('./User');
const Calculation = require('./Calculation');
const UserPreference = require('./UserPreference');
const ApiKey = require('./ApiKey');

// Define associations
User.hasMany(Calculation, { foreignKey: 'user_id', as: 'calculations' });
Calculation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(UserPreference, { foreignKey: 'user_id', as: 'preferences' });
UserPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ApiKey, { foreignKey: 'user_id', as: 'apiKeys' });
ApiKey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Calculation,
  UserPreference,
  ApiKey,
  testConnection
};
