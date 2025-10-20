/**
 * Analytics API Routes
 * 
 * Provides endpoints for advanced analytics and reporting
 * Phase 4: Advanced Analytics & Reporting
 */

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics');
const { verifyToken, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/analytics/trends
 * Get historical trends for user's carbon emissions
 */
router.get('/trends', verifyToken, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Validate timeRange
    const validRanges = ['7d', '30d', '90d', '1y'];
    if (!validRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time range. Must be one of: 7d, 30d, 90d, 1y'
      });
    }

    const trends = await analyticsService.getHistoricalTrends(req.user.id, timeRange);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve historical trends'
    });
  }
});

/**
 * GET /api/analytics/predictions
 * Get predictive insights based on historical data
 */
router.get('/predictions', verifyToken, async (req, res) => {
  try {
    const predictions = await analyticsService.getPredictiveInsights(req.user.id);
    
    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve predictive insights'
    });
  }
});

/**
 * GET /api/analytics/comparison
 * Get model and regional comparison data
 */
router.get('/comparison', verifyToken, async (req, res) => {
  try {
    const { type = 'both' } = req.query;
    
    let data = {};
    
    if (type === 'models' || type === 'both') {
      data.modelComparison = await analyticsService.getModelComparison(req.user.id);
    }
    
    if (type === 'regions' || type === 'both') {
      data.regionalComparison = await analyticsService.getRegionalComparison(req.user.id);
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve comparison data'
    });
  }
});

/**
 * GET /api/analytics/export
 * Export analytics data in specified format
 */
router.get('/export', verifyToken, async (req, res) => {
  try {
    const { format = 'json', timeRange = '30d' } = req.query;
    
    // Validate format
    const validFormats = ['json', 'csv'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Must be one of: json, csv'
      });
    }
    
    // Validate timeRange
    const validRanges = ['7d', '30d', '90d', '1y'];
    if (!validRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time range. Must be one of: 7d, 30d, 90d, 1y'
      });
    }

    const exportData = await analyticsService.exportAnalyticsData(req.user.id, format, timeRange);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      res.send(exportData.data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      res.json(exportData.data);
    }
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics data'
    });
  }
});

/**
 * GET /api/analytics/summary
 * Get comprehensive analytics summary
 */
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Get all analytics data in parallel
    const [trends, modelComparison, regionalComparison, predictions] = await Promise.all([
      analyticsService.getHistoricalTrends(req.user.id, timeRange),
      analyticsService.getModelComparison(req.user.id),
      analyticsService.getRegionalComparison(req.user.id),
      analyticsService.getPredictiveInsights(req.user.id)
    ]);
    
    res.json({
      success: true,
      data: {
        trends,
        modelComparison,
        regionalComparison,
        predictions,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics summary'
    });
  }
});

/**
 * GET /api/analytics/health
 * Health check for analytics service
 */
router.get('/health', optionalAuth, async (req, res) => {
  try {
    // Test analytics service with a simple query
    const testUserId = req.user ? req.user.id : 1; // Use dev user if not authenticated
    
    // Test basic functionality
    const trends = await analyticsService.getHistoricalTrends(testUserId, '7d');
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'analytics',
        version: '4.0.0',
        features: {
          historicalTrends: true,
          modelComparison: true,
          regionalComparison: true,
          predictiveInsights: true,
          dataExport: true
        },
        testResult: {
          trendsDataPoints: trends.trends.daily.length,
          summaryCalculations: trends.summary.totalCalculations
        }
      }
    });
  } catch (error) {
    console.error('Analytics health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Analytics service health check failed',
      details: error.message
    });
  }
});

module.exports = router;
