/**
 * Analytics Service
 * 
 * Provides advanced analytics and reporting capabilities for environmental impact data
 * Phase 4: Advanced Analytics & Reporting
 * 
 * @author AI Environmental Impact Calculator Team
 * @version 4.0.0
 */

const { Calculation, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get historical trends for a user's carbon emissions
 * @param {number} userId - User ID
 * @param {string} timeRange - Time range: '7d', '30d', '90d', '1y'
 * @returns {Promise<Object>} Historical trends data
 */
async function getHistoricalTrends(userId, timeRange = '30d') {
  try {
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get calculations within date range
    const calculations = await Calculation.findAll({
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: startDate
        }
      },
      order: [['created_at', 'ASC']]
    });

    // Group by date and aggregate
    const dailyData = {};
    const weeklyData = {};
    const monthlyData = {};

    calculations.forEach(calc => {
      const date = new Date(calc.created_at);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = getWeekKey(date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Daily aggregation
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: dayKey,
          tokens: 0,
          co2: 0,
          energy: 0,
          calculations: 0
        };
      }
      dailyData[dayKey].tokens += calc.tokens;
      dailyData[dayKey].co2 += parseFloat(calc.co2_kg);
      dailyData[dayKey].energy += parseFloat(calc.energy_kwh);
      dailyData[dayKey].calculations += 1;

      // Weekly aggregation
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          tokens: 0,
          co2: 0,
          energy: 0,
          calculations: 0
        };
      }
      weeklyData[weekKey].tokens += calc.tokens;
      weeklyData[weekKey].co2 += parseFloat(calc.co2_kg);
      weeklyData[weekKey].energy += parseFloat(calc.energy_kwh);
      weeklyData[weekKey].calculations += 1;

      // Monthly aggregation
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          tokens: 0,
          co2: 0,
          energy: 0,
          calculations: 0
        };
      }
      monthlyData[monthKey].tokens += calc.tokens;
      monthlyData[monthKey].co2 += parseFloat(calc.co2_kg);
      monthlyData[monthKey].energy += parseFloat(calc.energy_kwh);
      monthlyData[monthKey].calculations += 1;
    });

    // Calculate trends and statistics
    const dailyArray = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    const weeklyArray = Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
    const monthlyArray = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    const totalCo2 = calculations.reduce((sum, calc) => sum + parseFloat(calc.co2_kg), 0);
    const totalTokens = calculations.reduce((sum, calc) => sum + calc.tokens, 0);
    const totalEnergy = calculations.reduce((sum, calc) => sum + parseFloat(calc.energy_kwh), 0);

    // Calculate trend direction
    const trendDirection = calculateTrendDirection(dailyArray, 'co2');

    return {
      timeRange,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      summary: {
        totalCalculations: calculations.length,
        totalTokens,
        totalCo2: Math.round(totalCo2 * 1000) / 1000,
        totalEnergy: Math.round(totalEnergy * 1000) / 1000,
        averageCo2PerCalculation: calculations.length > 0 ? Math.round((totalCo2 / calculations.length) * 1000) / 1000 : 0,
        trendDirection
      },
      trends: {
        daily: dailyArray,
        weekly: weeklyArray,
        monthly: monthlyArray
      }
    };

  } catch (error) {
    console.error('Error getting historical trends:', error);
    throw new Error('Failed to retrieve historical trends');
  }
}

/**
 * Get model comparison analytics
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Model comparison data
 */
async function getModelComparison(userId) {
  try {
    const modelStats = await Calculation.findAll({
      where: { user_id: userId },
      attributes: [
        'model',
        [Calculation.sequelize.fn('COUNT', Calculation.sequelize.col('id')), 'count'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('tokens')), 'totalTokens'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'totalCo2'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('energy_kwh')), 'totalEnergy'],
        [Calculation.sequelize.fn('AVG', Calculation.sequelize.col('co2_kg')), 'avgCo2PerCalculation'],
        [Calculation.sequelize.fn('AVG', Calculation.sequelize.literal('co2_kg / tokens')), 'avgCo2PerToken']
      ],
      group: ['model'],
      order: [[Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'DESC']]
    });

    // Calculate efficiency metrics
    const modelComparison = modelStats.map(stat => {
      const data = stat.dataValues;
      return {
        model: data.model,
        calculations: parseInt(data.count),
        totalTokens: parseInt(data.totalTokens),
        totalCo2: Math.round(parseFloat(data.totalCo2) * 1000) / 1000,
        totalEnergy: Math.round(parseFloat(data.totalEnergy) * 1000) / 1000,
        avgCo2PerCalculation: Math.round(parseFloat(data.avgCo2PerCalculation) * 1000) / 1000,
        avgCo2PerToken: Math.round(parseFloat(data.avgCo2PerToken) * 1000000) / 1000000, // mg CO2 per token
        efficiency: calculateModelEfficiency(data.model, parseFloat(data.avgCo2PerToken))
      };
    });

    // Find most and least efficient models
    const mostEfficient = modelComparison.reduce((min, model) => 
      model.avgCo2PerToken < min.avgCo2PerToken ? model : min, modelComparison[0]);
    const leastEfficient = modelComparison.reduce((max, model) => 
      model.avgCo2PerToken > max.avgCo2PerToken ? model : max, modelComparison[0]);

    return {
      models: modelComparison,
      insights: {
        mostEfficient,
        leastEfficient,
        totalModels: modelComparison.length,
        efficiencyRange: mostEfficient && leastEfficient ? 
          Math.round((leastEfficient.avgCo2PerToken - mostEfficient.avgCo2PerToken) * 1000000) / 1000000 : 0
      }
    };

  } catch (error) {
    console.error('Error getting model comparison:', error);
    throw new Error('Failed to retrieve model comparison data');
  }
}

/**
 * Get regional comparison analytics
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Regional comparison data
 */
async function getRegionalComparison(userId) {
  try {
    const regionalStats = await Calculation.findAll({
      where: { user_id: userId },
      attributes: [
        'region',
        [Calculation.sequelize.fn('COUNT', Calculation.sequelize.col('id')), 'count'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('tokens')), 'totalTokens'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'totalCo2'],
        [Calculation.sequelize.fn('AVG', Calculation.sequelize.col('co2_kg')), 'avgCo2PerCalculation'],
        [Calculation.sequelize.fn('AVG', Calculation.sequelize.literal('co2_kg / energy_kwh')), 'avgCarbonIntensity']
      ],
      group: ['region'],
      order: [[Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'DESC']]
    });

    const regionalComparison = regionalStats.map(stat => {
      const data = stat.dataValues;
      return {
        region: data.region,
        calculations: parseInt(data.count),
        totalTokens: parseInt(data.totalTokens),
        totalCo2: Math.round(parseFloat(data.totalCo2) * 1000) / 1000,
        avgCo2PerCalculation: Math.round(parseFloat(data.avgCo2PerCalculation) * 1000) / 1000,
        avgCarbonIntensity: Math.round(parseFloat(data.avgCarbonIntensity) * 1000) / 1000,
        regionName: getRegionDisplayName(data.region)
      };
    });

    // Find highest and lowest carbon intensity regions
    const highestIntensity = regionalComparison.reduce((max, region) => 
      region.avgCarbonIntensity > max.avgCarbonIntensity ? region : max, regionalComparison[0]);
    const lowestIntensity = regionalComparison.reduce((min, region) => 
      region.avgCarbonIntensity < min.avgCarbonIntensity ? region : min, regionalComparison[0]);

    return {
      regions: regionalComparison,
      insights: {
        highestIntensity,
        lowestIntensity,
        totalRegions: regionalComparison.length,
        intensityRange: highestIntensity && lowestIntensity ? 
          Math.round((highestIntensity.avgCarbonIntensity - lowestIntensity.avgCarbonIntensity) * 1000) / 1000 : 0
      }
    };

  } catch (error) {
    console.error('Error getting regional comparison:', error);
    throw new Error('Failed to retrieve regional comparison data');
  }
}

/**
 * Get predictive insights based on historical data
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Predictive insights
 */
async function getPredictiveInsights(userId) {
  try {
    // Get last 30 days of data for prediction
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentCalculations = await Calculation.findAll({
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      order: [['created_at', 'ASC']]
    });

    if (recentCalculations.length < 7) {
      return {
        predictions: null,
        insights: {
          message: 'Insufficient data for predictions. Need at least 7 days of usage.',
          dataPoints: recentCalculations.length
        }
      };
    }

    // Simple linear trend analysis
    const dailyTotals = {};
    recentCalculations.forEach(calc => {
      const day = new Date(calc.created_at).toISOString().split('T')[0];
      if (!dailyTotals[day]) {
        dailyTotals[day] = { co2: 0, tokens: 0, count: 0 };
      }
      dailyTotals[day].co2 += parseFloat(calc.co2_kg);
      dailyTotals[day].tokens += calc.tokens;
      dailyTotals[day].count += 1;
    });

    const dailyArray = Object.entries(dailyTotals)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate trend
    const trend = calculateLinearTrend(dailyArray.map(d => d.co2));
    
    // Predictions for next 7 days
    const predictions = [];
    const lastValue = dailyArray[dailyArray.length - 1].co2;
    
    for (let i = 1; i <= 7; i++) {
      const predictedCo2 = Math.max(0, lastValue + (trend.slope * i));
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + i);
      
      predictions.push({
        date: predictedDate.toISOString().split('T')[0],
        predictedCo2: Math.round(predictedCo2 * 1000) / 1000,
        confidence: Math.max(0.3, 1 - (i * 0.1)) // Decreasing confidence over time
      });
    }

    // Calculate weekly and monthly projections
    const weeklyProjection = predictions.reduce((sum, p) => sum + p.predictedCo2, 0);
    const monthlyProjection = weeklyProjection * 4.33; // Approximate weeks in month

    return {
      predictions: {
        daily: predictions,
        weekly: Math.round(weeklyProjection * 1000) / 1000,
        monthly: Math.round(monthlyProjection * 1000) / 1000
      },
      insights: {
        trend: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
        trendStrength: Math.abs(trend.slope),
        confidence: trend.rSquared,
        dataPoints: dailyArray.length,
        message: trend.slope > 0 ? 
          'Your carbon footprint is trending upward. Consider optimizing your AI usage.' :
          trend.slope < 0 ? 
          'Great! Your carbon footprint is decreasing.' :
          'Your carbon footprint is stable.'
      }
    };

  } catch (error) {
    console.error('Error getting predictive insights:', error);
    throw new Error('Failed to retrieve predictive insights');
  }
}

/**
 * Export analytics data in specified format
 * @param {number} userId - User ID
 * @param {string} format - Export format: 'csv' or 'json'
 * @param {string} timeRange - Time range for export
 * @returns {Promise<Object>} Exported data
 */
async function exportAnalyticsData(userId, format = 'json', timeRange = '30d') {
  try {
    const trends = await getHistoricalTrends(userId, timeRange);
    const modelComparison = await getModelComparison(userId);
    const regionalComparison = await getRegionalComparison(userId);

    const exportData = {
      exportDate: new Date().toISOString(),
      timeRange,
      summary: trends.summary,
      trends: trends.trends,
      modelComparison: modelComparison.models,
      regionalComparison: regionalComparison.regions
    };

    if (format === 'csv') {
      return {
        format: 'csv',
        data: convertToCSV(exportData),
        filename: `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
      };
    } else {
      return {
        format: 'json',
        data: exportData,
        filename: `analytics-export-${new Date().toISOString().split('T')[0]}.json`
      };
    }

  } catch (error) {
    console.error('Error exporting analytics data:', error);
    throw new Error('Failed to export analytics data');
  }
}

// Helper functions

/**
 * Get week key for grouping
 * @param {Date} date - Date object
 * @returns {string} Week key (YYYY-WW format)
 */
function getWeekKey(date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Get week number of year
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Calculate trend direction
 * @param {Array} data - Array of data points
 * @param {string} field - Field to analyze
 * @returns {string} Trend direction
 */
function calculateTrendDirection(data, field) {
  if (data.length < 2) return 'insufficient_data';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, item) => sum + item[field], 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item[field], 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
}

/**
 * Calculate model efficiency score
 * @param {string} model - Model name
 * @param {number} co2PerToken - CO2 per token
 * @returns {string} Efficiency rating
 */
function calculateModelEfficiency(model, co2PerToken) {
  // Based on known model efficiencies (lower is better)
  const efficiencyThresholds = {
    'gpt4': 0.0000086,
    'gpt3': 0.0000043,
    'claude': 0.0000065,
    'gemini': 0.0000055,
    'default': 0.000006
  };
  
  const threshold = efficiencyThresholds[model] || 0.000006;
  const ratio = co2PerToken / threshold;
  
  if (ratio < 0.8) return 'excellent';
  if (ratio < 1.2) return 'good';
  if (ratio < 1.5) return 'average';
  return 'poor';
}

/**
 * Get region display name
 * @param {string} region - Region code
 * @returns {string} Display name
 */
function getRegionDisplayName(region) {
  const regionNames = {
    'global-average': 'Global Average',
    'united-states': 'United States',
    'canada': 'Canada',
    'germany': 'Germany',
    'france': 'France',
    'united-kingdom': 'United Kingdom',
    'china': 'China',
    'india': 'India',
    'japan': 'Japan',
    'australia': 'Australia'
  };
  
  return regionNames[region] || region.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Calculate linear trend
 * @param {Array} values - Array of values
 * @returns {Object} Trend analysis
 */
function calculateLinearTrend(values) {
  const n = values.length;
  const x = Array.from({length: n}, (_, i) => i);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = values.reduce((sum, yi) => sum + yi * yi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = values.reduce((sum, yi, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const ssTot = values.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);
  
  return { slope, intercept, rSquared };
}

/**
 * Convert data to CSV format
 * @param {Object} data - Data to convert
 * @returns {string} CSV string
 */
function convertToCSV(data) {
  const csvRows = [];
  
  // Summary section
  csvRows.push('SUMMARY');
  csvRows.push('Metric,Value');
  csvRows.push(`Total Calculations,${data.summary.totalCalculations}`);
  csvRows.push(`Total Tokens,${data.summary.totalTokens}`);
  csvRows.push(`Total CO2 (kg),${data.summary.totalCo2}`);
  csvRows.push(`Total Energy (kWh),${data.summary.totalEnergy}`);
  csvRows.push(`Average CO2 per Calculation,${data.summary.averageCo2PerCalculation}`);
  csvRows.push(`Trend Direction,${data.summary.trendDirection}`);
  csvRows.push('');
  
  // Daily trends
  csvRows.push('DAILY TRENDS');
  csvRows.push('Date,Tokens,CO2 (kg),Energy (kWh),Calculations');
  data.trends.daily.forEach(day => {
    csvRows.push(`${day.date},${day.tokens},${day.co2},${day.energy},${day.calculations}`);
  });
  csvRows.push('');
  
  // Model comparison
  csvRows.push('MODEL COMPARISON');
  csvRows.push('Model,Calculations,Total Tokens,Total CO2 (kg),Avg CO2 per Calculation,Avg CO2 per Token,Efficiency');
  data.modelComparison.forEach(model => {
    csvRows.push(`${model.model},${model.calculations},${model.totalTokens},${model.totalCo2},${model.avgCo2PerCalculation},${model.avgCo2PerToken},${model.efficiency}`);
  });
  csvRows.push('');
  
  // Regional comparison
  csvRows.push('REGIONAL COMPARISON');
  csvRows.push('Region,Calculations,Total Tokens,Total CO2 (kg),Avg CO2 per Calculation,Avg Carbon Intensity');
  data.regionalComparison.forEach(region => {
    csvRows.push(`${region.region},${region.calculations},${region.totalTokens},${region.totalCo2},${region.avgCo2PerCalculation},${region.avgCarbonIntensity}`);
  });
  
  return csvRows.join('\n');
}

module.exports = {
  getHistoricalTrends,
  getModelComparison,
  getRegionalComparison,
  getPredictiveInsights,
  exportAnalyticsData
};
