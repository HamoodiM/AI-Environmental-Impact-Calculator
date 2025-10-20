const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth, calculationRateLimit } = require('../middleware/auth');
const { Calculation, User } = require('../models');
const { calculateEnvironmentalImpact } = require('../calculations');
const { Op } = require('sequelize');

// Apply rate limiting to calculation routes
router.use(calculationRateLimit);

// Get user's calculation history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, model, region, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: req.user.id };

    // Add filters
    if (model) whereClause.model = model;
    if (region) whereClause.region = region;
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
      if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
    }

    const { count, rows: calculations } = await Calculation.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      calculations,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch calculation history' });
  }
});

// Create a new calculation (authenticated)
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { tokens, model, region, notes } = req.body;

    // Validate input
    if (!tokens || tokens <= 0) {
      return res.status(400).json({ error: 'Token count must be a positive number' });
    }

    // Calculate environmental impact (with real-time data enabled)
    const result = await calculateEnvironmentalImpact(parseInt(tokens), model, region, true);

    // Save to database
    const calculation = await Calculation.create({
      user_id: req.user.id,
      tokens: parseInt(tokens),
      model: model || 'default',
      region: region || 'global-average',
      energy_kwh: result.energy.total,
      co2_kg: result.co2.total,
      equivalences: result.equivalences,
      source: 'manual',
      notes: notes || null
    });

    res.status(201).json({
      id: calculation.id,
      ...result,
      created_at: calculation.created_at
    });
  } catch (error) {
    console.error('Calculation creation error:', error);
    res.status(500).json({ error: 'Failed to create calculation' });
  }
});

// Create a calculation (public endpoint with optional user tracking)
router.post('/calculate', optionalAuth, async (req, res) => {
  try {
    const { tokens, model, region } = req.body;

    // Validate input
    if (!tokens || tokens <= 0) {
      return res.status(400).json({ error: 'Token count must be a positive number' });
    }

    // Calculate environmental impact (with real-time data enabled)
    const result = await calculateEnvironmentalImpact(parseInt(tokens), model, region, true);

    // If user is authenticated, save the calculation
    if (req.user) {
      try {
        console.log('💾 Saving calculation for user:', req.user.id);
        const calculation = await Calculation.create({
          user_id: req.user.id,
          tokens: parseInt(tokens),
          model: model || 'default',
          region: region || 'global-average',
          energy_kwh: result.energy.total,
          co2_kg: result.co2.total,
          equivalences: result.equivalences,
          source: 'manual'
        });
        console.log('✅ Calculation saved with ID:', calculation.id);
      } catch (saveError) {
        console.error('❌ Failed to save calculation:', saveError);
        // Continue without saving if there's an error
      }
    } else {
      console.log('⚠️ No user authenticated, calculation not saved');
    }

    res.json(result);
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: error.message || 'Failed to calculate impact' });
  }
});

// Get a specific calculation
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const calculation = await Calculation.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    res.json(calculation);
  } catch (error) {
    console.error('Calculation fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch calculation' });
  }
});

// Update a calculation
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { notes } = req.body;

    const calculation = await Calculation.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    await calculation.update({ notes });

    res.json(calculation);
  } catch (error) {
    console.error('Calculation update error:', error);
    res.status(500).json({ error: 'Failed to update calculation' });
  }
});

// Delete a calculation
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const calculation = await Calculation.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    await calculation.destroy();

    res.json({ message: 'Calculation deleted successfully' });
  } catch (error) {
    console.error('Calculation deletion error:', error);
    res.status(500).json({ error: 'Failed to delete calculation' });
  }
});

// Export calculations as CSV
router.get('/export/csv', verifyToken, async (req, res) => {
  try {
    const calculations = await Calculation.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    // Convert to CSV
    const csvHeader = 'Date,Tokens,Model,Region,Energy (kWh),CO2 (kg),Car Miles,Flight Miles,Beef Burgers,Smartphone Charges,Tree Years\n';
    const csvRows = calculations.map(calc => {
      const date = new Date(calc.created_at).toISOString().split('T')[0];
      const equiv = calc.equivalences;
      return `${date},${calc.tokens},${calc.model},${calc.region},${calc.energy_kwh},${calc.co2_kg},${equiv.carMiles},${equiv.flightMiles},${equiv.beefBurgers},${equiv.smartphoneCharges},${equiv.treeYears}`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="calculations.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export calculations' });
  }
});

module.exports = router;
