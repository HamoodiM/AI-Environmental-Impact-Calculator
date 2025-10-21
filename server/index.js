const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { 
  calculateEnvironmentalImpact, 
  getAvailableModels, 
  getAvailableRegions,
  getModelInfo,
  getRegionInfo 
} = require('./calculations');

const { apiRateLimit, optionalAuth } = require('./middleware/auth');
const { testConnection } = require('./models');
const authRoutes = require('./routes/auth');
const calculationRoutes = require('./routes/calculations');
const carbonRoutes = require('./routes/carbon');
const analyticsRoutes = require('./routes/analytics');
const organizationRoutes = require('./routes/organizations');
const offsetRoutes = require('./routes/offsets');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// JWT authentication is now the default - no external dependencies required

// Test database connection
testConnection();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiRateLimit);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Environmental Impact Calculator API is running' });
});

// Get available models and regions
app.get('/api/models', (req, res) => {
  try {
    const models = getAvailableModels();
    const modelInfo = getModelInfo();
    res.json({ models, modelInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/regions', (req, res) => {
  try {
    const regions = getAvailableRegions();
    const regionInfo = getRegionInfo();
    res.json({ regions, regionInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/offsets', offsetRoutes);
app.use('/api/user', userRoutes);

// Legacy calculate endpoint (for backward compatibility)
app.post('/api/calculate', optionalAuth, async (req, res) => {
  try {
    const { tokens, model, region } = req.body;
    
    // Validate required fields
    if (!tokens) {
      return res.status(400).json({ error: 'Token count is required' });
    }
    
    // Validate token count
    const tokenCount = parseInt(tokens);
    if (isNaN(tokenCount) || tokenCount <= 0) {
      return res.status(400).json({ error: 'Token count must be a positive number' });
    }
    
    // Calculate impact (with real-time data enabled by default)
    const result = await calculateEnvironmentalImpact(tokenCount, model, region, true);
    
    // If user is authenticated, save the calculation
    if (req.user) {
      try {
        const { Calculation } = require('./models');
        await Calculation.create({
          user_id: req.user.id,
          tokens: tokenCount,
          model: model || 'default',
          region: region || 'global-average',
          energy_kwh: result.energy.total,
          co2_kg: result.co2.total,
          equivalences: result.equivalences,
          source: 'manual'
        });
      } catch (saveError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to save calculation:', saveError);
        }
        // Continue without saving if there's an error
      }
    }
    
    res.json(result);
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Legacy endpoint error:', error);
    }
    res.status(500).json({ error: error.message });
  }
});

// Batch calculation for multiple entries
app.post('/api/calculate/batch', async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries must be an array' });
    }
    
    const results = await Promise.all(entries.map(async entry => {
      const { tokens, model, region } = entry;
      return await calculateEnvironmentalImpact(tokens, model, region, true);
    }));
    
    res.json({ results });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get calculation statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      supportedModels: getAvailableModels().length,
      supportedRegions: getAvailableRegions().length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Environmental Impact Calculator API running on port ${PORT}`);
  console.log(`📊 Available at: http://localhost:${PORT}`);
  console.log(`🌱 Ready to calculate environmental impact!`);
});
