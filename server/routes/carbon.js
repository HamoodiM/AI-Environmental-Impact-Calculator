/**
 * Carbon Intensity API Routes
 * 
 * Provides endpoints for real-time carbon intensity data
 * Phase 3: Real-time carbon intensity integration
 */

const express = require('express');
const router = express.Router();
const carbonIntensityService = require('../services/carbonIntensity');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/carbon/regions
 * Get available regions for carbon intensity data
 */
router.get('/regions', optionalAuth, async (req, res) => {
  try {
    const regions = carbonIntensityService.getAvailableRegions();
    
    res.json({
      success: true,
      data: {
        regions: regions,
        count: Object.keys(regions).length,
        description: 'Available regions for carbon intensity data'
      }
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available regions'
    });
  }
});

/**
 * GET /api/carbon/intensity/:countryCode
 * Get real-time carbon intensity for a specific country
 */
router.get('/intensity/:countryCode', optionalAuth, async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    if (!countryCode || countryCode.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid country code. Must be a 2-letter ISO country code (e.g., US, DE, FR)'
      });
    }

    const carbonData = await carbonIntensityService.getCarbonIntensity(countryCode);
    
    res.json({
      success: true,
      data: carbonData
    });
  } catch (error) {
    console.error(`Error fetching carbon intensity for ${req.params.countryCode}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch carbon intensity data'
    });
  }
});

/**
 * POST /api/carbon/intensity/batch
 * Get carbon intensity for multiple countries
 */
router.post('/intensity/batch', optionalAuth, async (req, res) => {
  try {
    const { countryCodes } = req.body;
    
    if (!Array.isArray(countryCodes) || countryCodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'countryCodes must be a non-empty array of 2-letter ISO country codes'
      });
    }

    if (countryCodes.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 country codes allowed per request'
      });
    }

    // Validate country codes
    const invalidCodes = countryCodes.filter(code => !code || code.length !== 2);
    if (invalidCodes.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid country codes: ${invalidCodes.join(', ')}. Must be 2-letter ISO codes.`
      });
    }

    const carbonData = await carbonIntensityService.getMultipleCarbonIntensities(countryCodes);
    
    res.json({
      success: true,
      data: {
        results: carbonData,
        count: carbonData.length,
        requested: countryCodes.length
      }
    });
  } catch (error) {
    console.error('Error fetching batch carbon intensity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batch carbon intensity data'
    });
  }
});

/**
 * GET /api/carbon/cache/stats
 * Get carbon intensity cache statistics
 */
router.get('/cache/stats', optionalAuth, async (req, res) => {
  try {
    const stats = carbonIntensityService.getCacheStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache statistics'
    });
  }
});

/**
 * DELETE /api/carbon/cache
 * Clear carbon intensity cache
 */
router.delete('/cache', optionalAuth, async (req, res) => {
  try {
    carbonIntensityService.clearCache();
    
    res.json({
      success: true,
      message: 'Carbon intensity cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

/**
 * GET /api/carbon/health
 * Health check for carbon intensity service
 */
router.get('/health', optionalAuth, async (req, res) => {
  try {
    // Test with a known country code
    const testData = await carbonIntensityService.getCarbonIntensity('US');
    const cacheStats = carbonIntensityService.getCacheStats();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'carbon-intensity',
        version: '3.0.0',
        features: {
          realTimeData: !!process.env.CO2SIGNAL_API_KEY,
          caching: true,
          fallbackData: true
        },
        cache: cacheStats,
        testResult: {
          country: 'US',
          carbonIntensity: testData.carbonIntensity,
          source: testData.source
        }
      }
    });
  } catch (error) {
    console.error('Carbon intensity health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Carbon intensity service health check failed',
      details: error.message
    });
  }
});

module.exports = router;
