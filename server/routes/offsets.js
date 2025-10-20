/**
 * Carbon Offset API Routes
 * 
 * Provides endpoints for carbon offset calculations and suggestions
 * Phase 4: Carbon Offset Suggestions
 */

const express = require('express');
const router = express.Router();
const offsetService = require('../services/offsetSuggestions');
const { verifyToken, optionalAuth } = require('../middleware/auth');

/**
 * POST /api/offsets/calculate
 * Calculate offset cost for given CO₂ amount
 */
router.post('/calculate', optionalAuth, async (req, res) => {
  try {
    const { co2Kg, projectType = 'reforestation' } = req.body;
    
    // Validate input
    if (!co2Kg || co2Kg <= 0) {
      return res.status(400).json({
        success: false,
        error: 'CO₂ amount (co2Kg) must be a positive number'
      });
    }

    if (typeof co2Kg !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'CO₂ amount must be a number'
      });
    }

    // Validate project type
    const validProjectTypes = Object.keys(offsetService.OFFSET_PROJECTS);
    if (!validProjectTypes.includes(projectType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid project type. Must be one of: ${validProjectTypes.join(', ')}`
      });
    }

    const calculation = offsetService.calculateOffsetCost(co2Kg, projectType);
    
    res.json({
      success: true,
      data: calculation
    });
  } catch (error) {
    console.error('Error calculating offset cost:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate offset cost'
    });
  }
});

/**
 * POST /api/offsets/suggestions
 * Get offset project suggestions
 */
router.post('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { co2Kg, preferences = {} } = req.body;
    
    // Validate input
    if (!co2Kg || co2Kg <= 0) {
      return res.status(400).json({
        success: false,
        error: 'CO₂ amount (co2Kg) must be a positive number'
      });
    }

    if (typeof co2Kg !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'CO₂ amount must be a number'
      });
    }

    const suggestions = offsetService.suggestProjects(co2Kg, preferences);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting offset suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get offset suggestions'
    });
  }
});

/**
 * GET /api/offsets/providers
 * Get free offset providers and resources
 */
router.get('/providers', optionalAuth, async (req, res) => {
  try {
    const providers = offsetService.getOffsetProviders();
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error getting offset providers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve offset providers'
    });
  }
});

/**
 * POST /api/offsets/equivalences
 * Calculate offset impact equivalences
 */
router.post('/equivalences', optionalAuth, async (req, res) => {
  try {
    const { co2Kg } = req.body;
    
    // Validate input
    if (!co2Kg || co2Kg <= 0) {
      return res.status(400).json({
        success: false,
        error: 'CO₂ amount (co2Kg) must be a positive number'
      });
    }

    if (typeof co2Kg !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'CO₂ amount must be a number'
      });
    }

    const equivalences = offsetService.calculateOffsetEquivalences(co2Kg);
    
    res.json({
      success: true,
      data: equivalences
    });
  } catch (error) {
    console.error('Error calculating offset equivalences:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate offset equivalences'
    });
  }
});

/**
 * GET /api/offsets/education
 * Get educational content about carbon offsets
 */
router.get('/education', optionalAuth, async (req, res) => {
  try {
    const education = offsetService.getEducationalContent();
    
    res.json({
      success: true,
      data: education
    });
  } catch (error) {
    console.error('Error getting educational content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve educational content'
    });
  }
});

/**
 * GET /api/offsets/projects
 * Get available offset project types
 */
router.get('/projects', optionalAuth, async (req, res) => {
  try {
    const projects = Object.entries(offsetService.OFFSET_PROJECTS).map(([type, project]) => ({
      type,
      name: project.name,
      description: project.description,
      costPerTon: project.costPerTon,
      effectiveness: project.effectiveness,
      duration: project.duration,
      coBenefits: project.coBenefits,
      providers: project.providers
    }));
    
    res.json({
      success: true,
      data: {
        projects,
        count: projects.length,
        summary: {
          costRange: {
            min: Math.min(...projects.map(p => p.costPerTon)),
            max: Math.max(...projects.map(p => p.costPerTon))
          },
          averageCost: Math.round(projects.reduce((sum, p) => sum + p.costPerTon, 0) / projects.length * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Error getting offset projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve offset projects'
    });
  }
});

/**
 * GET /api/offsets/health
 * Health check for offset service
 */
router.get('/health', optionalAuth, async (req, res) => {
  try {
    // Test offset service with a simple calculation
    const testCalculation = offsetService.calculateOffsetCost(1000, 'reforestation');
    const testSuggestions = offsetService.suggestProjects(1000);
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'carbon-offsets',
        version: '4.0.0',
        features: {
          costCalculation: true,
          projectSuggestions: true,
          equivalences: true,
          educationalContent: true,
          freeResources: true
        },
        testResult: {
          calculationCost: testCalculation.cost.effective,
          suggestionsCount: testSuggestions.suggestions.length,
          availableProjects: Object.keys(offsetService.OFFSET_PROJECTS).length
        }
      }
    });
  } catch (error) {
    console.error('Offset service health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Offset service health check failed',
      details: error.message
    });
  }
});

module.exports = router;
