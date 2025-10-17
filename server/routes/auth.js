const express = require('express');
const router = express.Router();
const { verifyToken, authRateLimit } = require('../middleware/auth');
const { User, UserPreference } = require('../models');

// Apply rate limiting to all auth routes
router.use(authRateLimit);

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: UserPreference,
          as: 'preferences'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      last_login: user.last_login,
      preferences: user.preferences || {
        default_model: 'default',
        default_region: 'global-average',
        units_preference: 'metric',
        notifications_enabled: true,
        email_notifications: false,
        weekly_reports: false,
        theme: 'light'
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ name });
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update user preferences
router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const {
      default_model,
      default_region,
      units_preference,
      notifications_enabled,
      email_notifications,
      weekly_reports,
      theme
    } = req.body;

    const [preferences, created] = await UserPreference.findOrCreate({
      where: { user_id: req.user.id },
      defaults: {
        user_id: req.user.id,
        default_model: 'default',
        default_region: 'global-average',
        units_preference: 'metric',
        notifications_enabled: true,
        email_notifications: false,
        weekly_reports: false,
        theme: 'light'
      }
    });

    await preferences.update({
      default_model: default_model || preferences.default_model,
      default_region: default_region || preferences.default_region,
      units_preference: units_preference || preferences.units_preference,
      notifications_enabled: notifications_enabled !== undefined ? notifications_enabled : preferences.notifications_enabled,
      email_notifications: email_notifications !== undefined ? email_notifications : preferences.email_notifications,
      weekly_reports: weekly_reports !== undefined ? weekly_reports : preferences.weekly_reports,
      theme: theme || preferences.theme
    });

    res.json(preferences);
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Delete user account
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete - mark as inactive
    await user.update({ is_active: false });
    
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Get user statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { Calculation } = require('../models');
    
    const stats = await Calculation.findAll({
      where: { user_id: req.user.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_calculations'],
        [sequelize.fn('SUM', sequelize.col('tokens')), 'total_tokens'],
        [sequelize.fn('SUM', sequelize.col('energy_kwh')), 'total_energy'],
        [sequelize.fn('SUM', sequelize.col('co2_kg')), 'total_co2']
      ],
      raw: true
    });

    const modelStats = await Calculation.findAll({
      where: { user_id: req.user.id },
      attributes: [
        'model',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('tokens')), 'tokens']
      ],
      group: ['model'],
      raw: true
    });

    const regionStats = await Calculation.findAll({
      where: { user_id: req.user.id },
      attributes: [
        'region',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('co2_kg')), 'co2']
      ],
      group: ['region'],
      raw: true
    });

    res.json({
      overview: stats[0] || {
        total_calculations: 0,
        total_tokens: 0,
        total_energy: 0,
        total_co2: 0
      },
      by_model: modelStats,
      by_region: regionStats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
