const express = require('express');
const router = express.Router();
const { verifyToken, apiRateLimit } = require('../middleware/auth');
const { User, UserPreference, Calculation } = require('../models');

// Apply rate limiting to user routes
router.use(apiRateLimit);

/**
 * @route GET /api/user/preferences
 * @desc Get user preferences
 * @access Private (User)
 */
router.get('/preferences', verifyToken, async (req, res) => {
  try {
    let preferences = await UserPreference.findOne({
      where: { user_id: req.user.id }
    });

    if (!preferences) {
      // Create default preferences if none exist
      preferences = await UserPreference.create({
        user_id: req.user.id,
        default_model: 'default',
        default_region: 'global-average',
        notifications_enabled: true,
        email_notifications: false,
        weekly_reports: false,
        theme: 'light'
      });
    }

    res.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch preferences', details: error.message });
  }
});

/**
 * @route PUT /api/user/preferences
 * @desc Update user preferences
 * @access Private (User)
 */
router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const { default_model, default_region, notifications_enabled, email_notifications, weekly_reports, theme } = req.body;

    let preferences = await UserPreference.findOne({
      where: { user_id: req.user.id }
    });

    if (!preferences) {
      preferences = await UserPreference.create({
        user_id: req.user.id,
        default_model: default_model || 'default',
        default_region: default_region || 'global-average',
        notifications_enabled: notifications_enabled !== undefined ? notifications_enabled : true,
        email_notifications: email_notifications || false,
        weekly_reports: weekly_reports || false,
        theme: theme || 'light'
      });
    } else {
      await preferences.update({
        default_model: default_model || preferences.default_model,
        default_region: default_region || preferences.default_region,
        notifications_enabled: notifications_enabled !== undefined ? notifications_enabled : preferences.notifications_enabled,
        email_notifications: email_notifications !== undefined ? email_notifications : preferences.email_notifications,
        weekly_reports: weekly_reports !== undefined ? weekly_reports : preferences.weekly_reports,
        theme: theme || preferences.theme
      });
    }

    res.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences', details: error.message });
  }
});

/**
 * @route DELETE /api/user/delete
 * @desc Delete user account
 * @access Private (User)
 */
router.delete('/delete', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user preferences
    await UserPreference.destroy({
      where: { user_id: userId }
    });

    // Delete user calculations
    await Calculation.destroy({
      where: { user_id: userId }
    });

    // Delete user
    await User.destroy({
      where: { id: userId }
    });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account', details: error.message });
  }
});

module.exports = router;
