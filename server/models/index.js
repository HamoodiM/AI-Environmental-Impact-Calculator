const sequelize = require('../config/sequelize');
const User = require('./User');
const Calculation = require('./Calculation');
const UserPreference = require('./UserPreference');
const ApiKey = require('./ApiKey');
const Organization = require('./Organization');
const OrganizationMember = require('./OrganizationMember');

// Define associations
User.hasMany(Calculation, { foreignKey: 'user_id', as: 'calculations' });
Calculation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(UserPreference, { foreignKey: 'user_id', as: 'preferences' });
UserPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ApiKey, { foreignKey: 'user_id', as: 'apiKeys' });
ApiKey.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Organization associations
User.hasMany(Organization, { foreignKey: 'owner_id', as: 'ownedOrganizations' });
Organization.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.belongsToMany(Organization, { 
  through: OrganizationMember, 
  foreignKey: 'user_id', 
  otherKey: 'org_id',
  as: 'organizations' 
});
Organization.belongsToMany(User, { 
  through: OrganizationMember, 
  foreignKey: 'org_id', 
  otherKey: 'user_id',
  as: 'members' 
});

Organization.hasMany(OrganizationMember, { foreignKey: 'org_id', as: 'memberships' });
OrganizationMember.belongsTo(Organization, { foreignKey: 'org_id', as: 'organization' });

OrganizationMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
OrganizationMember.belongsTo(User, { foreignKey: 'invited_by', as: 'inviter' });

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
  Organization,
  OrganizationMember,
  testConnection
};
