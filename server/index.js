const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { 
  calculateEnvironmentalImpact, 
  getAvailableModels, 
  getAvailableRegions,
  getModelInfo,
  getRegionInfo 
} = require('./calculations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

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

// Calculate environmental impact
app.post('/api/calculate', (req, res) => {
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
    
    // Calculate impact
    const result = calculateEnvironmentalImpact(tokenCount, model, region);
    res.json(result);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch calculation for multiple entries
app.post('/api/calculate/batch', (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries must be an array' });
    }
    
    const results = entries.map(entry => {
      const { tokens, model, region } = entry;
      return calculateEnvironmentalImpact(tokens, model, region);
    });
    
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
