const { User, UserPreference } = require('../models');

async function createDevUser() {
  try {
    console.log('🔄 Creating development user...');
    
    // Check if dev user already exists
    let user = await User.findOne({ where: { email: 'dev@example.com' } });
    
    if (!user) {
      // Create dev user
      user = await User.create({
        firebase_uid: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        avatar_url: null,
        is_active: true,
        last_login: new Date()
      });
      console.log('✅ Development user created');
    } else {
      console.log('ℹ️ Development user already exists');
    }
    
    // Create default preferences for dev user
    const [preferences, created] = await UserPreference.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        default_model: 'default',
        default_region: 'global-average',
        units_preference: 'metric',
        notifications_enabled: true,
        email_notifications: false,
        weekly_reports: false,
        theme: 'light'
      }
    });
    
    if (created) {
      console.log('✅ Default preferences created for dev user');
    } else {
      console.log('ℹ️ Preferences already exist for dev user');
    }
    
    console.log('🎉 Development user setup completed!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    
  } catch (error) {
    console.error('❌ Error creating development user:', error);
    process.exit(1);
  }
}

createDevUser();
