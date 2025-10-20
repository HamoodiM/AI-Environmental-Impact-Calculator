/**
 * AI Environmental Impact Calculator - Core Calculation Logic
 * Based on research data and conservative estimates
 * 
 * Phase 3: Enhanced with real-time carbon intensity data
 */

const carbonIntensityService = require('./services/carbonIntensity');

// Energy consumption estimates (in kWh per 1M tokens)
// Based on research: GPT-3 training consumed ~1,287 MWh for ~300B tokens
// Inference is typically 10-100x more efficient than training
const ENERGY_PER_TOKEN = {
  // Conservative estimates based on research
  gpt3: 0.0000043, // kWh per token (inference)
  gpt4: 0.0000086, // kWh per token (inference, estimated 2x GPT-3)
  claude: 0.0000065, // kWh per token (inference, estimated)
  gemini: 0.0000055, // kWh per token (inference, estimated)
  default: 0.000006 // kWh per token (average)
};

// Regional CO2 emission factors (kg CO2 per kWh)
const CO2_EMISSION_FACTORS = {
  'global-average': 0.475, // kg CO2/kWh
  'usa-average': 0.416, // kg CO2/kWh
  'europe-average': 0.276, // kg CO2/kWh
  'china-average': 0.581, // kg CO2/kWh
  'canada-average': 0.130, // kg CO2/kWh
  'iowa-usa': 0.737, // kg CO2/kWh (high carbon intensity)
  'quebec-canada': 0.020, // kg CO2/kWh (low carbon intensity)
  'renewable': 0.050 // kg CO2/kWh (renewable energy)
};

// Environmental equivalence factors
const EQUIVALENCE_FACTORS = {
  // CO2 emissions per activity (kg CO2)
  carMilePerGallon: 0.411, // kg CO2 per mile (average car, 25 mpg)
  flightPerMile: 0.255, // kg CO2 per mile (domestic flight)
  beefBurger: 3.4, // kg CO2 per burger
  smartphoneCharge: 0.0001, // kg CO2 per charge
  householdElectricityPerDay: 20.5, // kg CO2 per day (average US household)
  treeYearAbsorption: 22, // kg CO2 absorbed per tree per year
  laptopHour: 0.05, // kg CO2 per hour of laptop use
  lightbulbHour: 0.0004 // kg CO2 per hour (LED bulb)
};

/**
 * Calculate environmental impact for given token usage
 * @param {number} tokens - Number of tokens used
 * @param {string} model - AI model type
 * @param {string} region - Geographic region for CO2 calculation
 * @param {boolean} useRealTimeData - Whether to use real-time carbon intensity data
 * @returns {Promise<Object>} Environmental impact calculations
 */
async function calculateEnvironmentalImpact(tokens, model = 'default', region = 'global-average', useRealTimeData = true) {
  // Validate inputs
  if (!tokens || tokens <= 0) {
    throw new Error('Token count must be a positive number');
  }

  // Get energy consumption per token for the model
  const energyPerToken = ENERGY_PER_TOKEN[model] || ENERGY_PER_TOKEN.default;
  
  // Calculate total energy consumption (kWh)
  const totalEnergy = tokens * energyPerToken;
  
  let co2Factor;
  let carbonData = null;
  
  // Get CO2 emission factor - use real-time data if available and requested
  if (useRealTimeData && region !== 'global-average' && region !== 'renewable') {
    try {
      // Try to get real-time carbon intensity data
      carbonData = await carbonIntensityService.getCarbonIntensity(region);
      co2Factor = carbonData.carbonIntensity / 1000; // Convert gCO2/kWh to kgCO2/kWh
      console.log(`🌍 Using real-time carbon intensity for ${region}: ${carbonData.carbonIntensity} gCO2/kWh`);
    } catch (error) {
      console.warn(`⚠️ Failed to get real-time data for ${region}, using fallback:`, error.message);
      co2Factor = CO2_EMISSION_FACTORS[region] || CO2_EMISSION_FACTORS['global-average'];
    }
  } else {
    // Use static data for global average, renewable, or when real-time is disabled
    co2Factor = CO2_EMISSION_FACTORS[region] || CO2_EMISSION_FACTORS['global-average'];
  }
  
  // Calculate total CO2 emissions (kg)
  const totalCO2 = totalEnergy * co2Factor;
  
  // Calculate environmental equivalences
  const equivalences = {
    carMiles: totalCO2 / EQUIVALENCE_FACTORS.carMilePerGallon,
    flightMiles: totalCO2 / EQUIVALENCE_FACTORS.flightPerMile,
    beefBurgers: totalCO2 / EQUIVALENCE_FACTORS.beefBurger,
    smartphoneCharges: totalCO2 / EQUIVALENCE_FACTORS.smartphoneCharge,
    householdElectricityDays: totalCO2 / EQUIVALENCE_FACTORS.householdElectricityPerDay,
    treeYears: totalCO2 / EQUIVALENCE_FACTORS.treeYearAbsorption,
    laptopHours: totalCO2 / EQUIVALENCE_FACTORS.laptopHour,
    lightbulbHours: totalCO2 / EQUIVALENCE_FACTORS.lightbulbHour
  };
  
  const result = {
    tokens,
    model,
    region,
    energy: {
      total: totalEnergy,
      unit: 'kWh'
    },
    co2: {
      total: totalCO2,
      unit: 'kg CO2e',
      factor: co2Factor,
      factorUnit: 'kg CO2/kWh'
    },
    equivalences: {
      carMiles: Math.round(equivalences.carMiles * 100) / 100,
      flightMiles: Math.round(equivalences.flightMiles * 100) / 100,
      beefBurgers: Math.round(equivalences.beefBurgers * 100) / 100,
      smartphoneCharges: Math.round(equivalences.smartphoneCharges),
      householdElectricityDays: Math.round(equivalences.householdElectricityDays * 100) / 100,
      treeYears: Math.round(equivalences.treeYears * 100) / 100,
      laptopHours: Math.round(equivalences.laptopHours * 100) / 100,
      lightbulbHours: Math.round(equivalences.lightbulbHours)
    },
    metadata: {
      realTimeData: useRealTimeData && carbonData !== null,
      dataSource: carbonData ? carbonData.source : 'static',
      timestamp: carbonData ? carbonData.timestamp : new Date().toISOString(),
      fossilFuelPercentage: carbonData ? carbonData.fossilFuelPercentage : null,
      renewablePercentage: carbonData ? carbonData.renewablePercentage : null
    }
  };
  
  return result;
}

/**
 * Get available models
 */
function getAvailableModels() {
  return Object.keys(ENERGY_PER_TOKEN);
}

/**
 * Get available regions
 */
function getAvailableRegions() {
  // Get regions from carbon intensity service (includes real-time data regions)
  const carbonRegions = carbonIntensityService.getAvailableRegions();
  
  // Merge with static regions
  const staticRegions = Object.keys(CO2_EMISSION_FACTORS);
  const allRegions = [...new Set([...Object.keys(carbonRegions), ...staticRegions])];
  
  return allRegions;
}

/**
 * Get model information
 */
function getModelInfo() {
  return {
    'gpt3': 'GPT-3 (OpenAI)',
    'gpt4': 'GPT-4 (OpenAI)',
    'claude': 'Claude (Anthropic)',
    'gemini': 'Gemini (Google)',
    'default': 'Average Model'
  };
}

/**
 * Get region information
 */
function getRegionInfo() {
  return {
    'global-average': 'Global Average',
    'usa-average': 'USA Average',
    'europe-average': 'Europe Average',
    'china-average': 'China Average',
    'canada-average': 'Canada Average',
    'iowa-usa': 'Iowa, USA (High Carbon)',
    'quebec-canada': 'Quebec, Canada (Low Carbon)',
    'renewable': 'Renewable Energy'
  };
}

module.exports = {
  calculateEnvironmentalImpact,
  getAvailableModels,
  getAvailableRegions,
  getModelInfo,
  getRegionInfo,
  ENERGY_PER_TOKEN,
  CO2_EMISSION_FACTORS,
  EQUIVALENCE_FACTORS
};
