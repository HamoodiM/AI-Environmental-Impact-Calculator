const { sequelize } = require('../models');
const { User, Calculation, UserPreference, ApiKey, Organization, OrganizationMember } = require('../models');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synchronized successfully.');
    
    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
