/**
 * Carbon Offset Suggestions Service
 * 
 * Provides carbon offset calculations and project suggestions
 * Phase 4: Carbon Offset Suggestions
 * 
 * @author AI Environmental Impact Calculator Team
 * @version 4.0.0
 */

// Carbon offset project data (based on publicly available information)
const OFFSET_PROJECTS = {
  'reforestation': {
    name: 'Reforestation Projects',
    description: 'Planting trees to absorb CO₂ from the atmosphere',
    costPerTon: 15, // USD per ton CO₂
    effectiveness: 0.85, // 85% effectiveness
    duration: '20-50 years',
    coBenefits: ['Biodiversity', 'Soil conservation', 'Water quality'],
    providers: ['One Tree Planted', 'Trees for the Future', 'Eden Reforestation'],
    learnMoreUrl: 'https://onetreeplanted.org/',
    providerUrls: {
      'One Tree Planted': 'https://onetreeplanted.org/',
      'Trees for the Future': 'https://trees.org/',
      'Eden Reforestation': 'https://edenprojects.org/'
    }
  },
  'renewable-energy': {
    name: 'Renewable Energy Projects',
    description: 'Supporting wind, solar, and hydroelectric power projects',
    costPerTon: 25, // USD per ton CO₂
    effectiveness: 0.95, // 95% effectiveness
    duration: '10-25 years',
    coBenefits: ['Clean energy', 'Job creation', 'Energy independence'],
    providers: ['Gold Standard', 'VCS', 'Climate Action Reserve'],
    learnMoreUrl: 'https://www.goldstandard.org/',
    providerUrls: {
      'Gold Standard': 'https://www.goldstandard.org/',
      'VCS': 'https://verra.org/',
      'Climate Action Reserve': 'https://www.climateactionreserve.org/'
    }
  },
  'methane-capture': {
    name: 'Methane Capture Projects',
    description: 'Capturing methane from landfills and agricultural operations',
    costPerTon: 12, // USD per ton CO₂
    effectiveness: 0.90, // 90% effectiveness
    duration: '5-15 years',
    coBenefits: ['Air quality', 'Waste reduction', 'Energy generation'],
    providers: ['American Carbon Registry', 'Climate Action Reserve'],
    learnMoreUrl: 'https://americancarbonregistry.org/',
    providerUrls: {
      'American Carbon Registry': 'https://americancarbonregistry.org/',
      'Climate Action Reserve': 'https://www.climateactionreserve.org/'
    }
  },
  'cookstove': {
    name: 'Clean Cookstove Projects',
    description: 'Replacing traditional cookstoves with efficient alternatives',
    costPerTon: 8, // USD per ton CO₂
    effectiveness: 0.80, // 80% effectiveness
    duration: '3-10 years',
    coBenefits: ['Health benefits', 'Time savings', 'Fuel efficiency'],
    providers: ['Gold Standard', 'VCS', 'Clean Development Mechanism'],
    learnMoreUrl: 'https://www.goldstandard.org/our-work/clean-cooking',
    providerUrls: {
      'Gold Standard': 'https://www.goldstandard.org/',
      'VCS': 'https://verra.org/',
      'Clean Development Mechanism': 'https://cdm.unfccc.int/'
    }
  },
  'forest-conservation': {
    name: 'Forest Conservation',
    description: 'Protecting existing forests from deforestation',
    costPerTon: 18, // USD per ton CO₂
    effectiveness: 0.88, // 88% effectiveness
    duration: '15-30 years',
    coBenefits: ['Biodiversity', 'Indigenous rights', 'Ecosystem services'],
    providers: ['REDD+', 'VCS', 'Gold Standard'],
    learnMoreUrl: 'https://www.un-redd.org/',
    providerUrls: {
      'REDD+': 'https://www.un-redd.org/',
      'VCS': 'https://verra.org/',
      'Gold Standard': 'https://www.goldstandard.org/'
    }
  }
};

// Free offset resources and calculators
const FREE_OFFSET_RESOURCES = [
  {
    name: 'EPA Carbon Footprint Calculator',
    url: 'https://www.epa.gov/carbon-footprint-calculator',
    description: 'Calculate your personal carbon footprint',
    type: 'calculator'
  },
  {
    name: 'Carbon Fund',
    url: 'https://carbonfund.org/',
    description: 'Carbon offset projects and education',
    type: 'provider'
  },
  {
    name: 'Cool Effect',
    url: 'https://www.cooleffect.org/',
    description: 'Verified carbon offset projects',
    type: 'provider'
  },
  {
    name: 'Gold Standard',
    url: 'https://www.goldstandard.org/',
    description: 'Premium carbon offset standard',
    type: 'standard'
  },
  {
    name: 'Verified Carbon Standard (VCS)',
    url: 'https://verra.org/',
    description: 'Leading carbon offset standard',
    type: 'standard'
  },
  {
    name: 'One Tree Planted',
    url: 'https://onetreeplanted.org/',
    description: 'Tree planting projects worldwide',
    type: 'provider'
  }
];

/**
 * Calculate offset cost for given CO₂ amount
 * @param {number} co2Kg - CO₂ amount in kg
 * @param {string} projectType - Type of offset project
 * @returns {Object} Offset calculation result
 */
function calculateOffsetCost(co2Kg, projectType = 'reforestation') {
  try {
    const co2Tons = co2Kg / 1000; // Convert kg to tons
    const project = OFFSET_PROJECTS[projectType];
    
    if (!project) {
      throw new Error('Invalid project type');
    }

    const baseCost = co2Tons * project.costPerTon;
    const effectiveCost = baseCost / project.effectiveness; // Adjust for effectiveness
    const totalCost = Math.round(effectiveCost * 100) / 100;

    return {
      co2Kg,
      co2Tons: Math.round(co2Tons * 1000) / 1000,
      projectType,
      project: {
        name: project.name,
        description: project.description,
        costPerTon: project.costPerTon,
        effectiveness: project.effectiveness,
        duration: project.duration
      },
      cost: {
        base: Math.round(baseCost * 100) / 100,
        effective: totalCost,
        currency: 'USD'
      },
      impact: {
        co2Offset: Math.round(co2Tons * project.effectiveness * 1000) / 1000,
        effectiveness: project.effectiveness
      }
    };

  } catch (error) {
    console.error('Error calculating offset cost:', error);
    throw new Error('Failed to calculate offset cost');
  }
}

/**
 * Get offset project suggestions based on CO₂ amount and preferences
 * @param {number} co2Kg - CO₂ amount in kg
 * @param {Object} preferences - User preferences
 * @returns {Array} Array of offset project suggestions
 */
function suggestProjects(co2Kg, preferences = {}) {
  try {
    const co2Tons = co2Kg / 1000;
    const suggestions = [];

    // Generate suggestions for each project type
    Object.entries(OFFSET_PROJECTS).forEach(([type, project]) => {
      const calculation = calculateOffsetCost(co2Kg, type);
      
      // Calculate impact metrics
      const treesEquivalent = Math.round(co2Tons * 0.5); // Rough estimate: 0.5 trees per ton
      const carMilesOffset = Math.round(co2Tons * 2200); // Rough estimate: 1 ton = 2200 car miles
      
      suggestions.push({
        type,
        name: project.name,
        description: project.description,
        cost: calculation.cost.effective,
        currency: 'USD',
        effectiveness: project.effectiveness,
        duration: project.duration,
        coBenefits: project.coBenefits,
        providers: project.providers,
        learnMoreUrl: project.learnMoreUrl,
        providerUrls: project.providerUrls,
        impact: {
          co2Offset: calculation.impact.co2Offset,
          treesEquivalent,
          carMilesOffset,
          costPerTon: project.costPerTon
        },
        recommendation: getRecommendation(type, co2Tons, preferences)
      });
    });

    // Sort by cost-effectiveness (lower cost per ton is better)
    suggestions.sort((a, b) => a.cost - b.cost);

    // Add top 3 recommendations
    const topRecommendations = suggestions.slice(0, 3).map((suggestion, index) => ({
      ...suggestion,
      rank: index + 1,
      badge: index === 0 ? 'Best Value' : index === 1 ? 'Most Effective' : 'Quick Impact'
    }));

    return {
      co2Kg,
      co2Tons: Math.round(co2Tons * 1000) / 1000,
      suggestions: topRecommendations,
      allProjects: suggestions,
      summary: {
        totalProjects: suggestions.length,
        costRange: {
          min: Math.min(...suggestions.map(s => s.cost)),
          max: Math.max(...suggestions.map(s => s.cost))
        },
        averageCost: Math.round(suggestions.reduce((sum, s) => sum + s.cost, 0) / suggestions.length * 100) / 100
      }
    };

  } catch (error) {
    console.error('Error suggesting projects:', error);
    throw new Error('Failed to suggest offset projects');
  }
}

/**
 * Get recommendation based on project type and preferences
 * @param {string} type - Project type
 * @param {number} co2Tons - CO₂ amount in tons
 * @param {Object} preferences - User preferences
 * @returns {string} Recommendation text
 */
function getRecommendation(type, co2Tons, preferences) {
  const recommendations = {
    'reforestation': co2Tons < 1 ? 
      'Perfect for small offsets. Trees provide long-term carbon storage and biodiversity benefits.' :
      'Excellent for larger offsets. Provides significant long-term carbon sequestration.',
    
    'renewable-energy': co2Tons < 0.5 ?
      'Great for small offsets. Supports clean energy transition.' :
      'Ideal for larger offsets. High effectiveness and immediate impact.',
    
    'methane-capture': co2Tons < 2 ?
      'Good for medium offsets. Captures potent greenhouse gases.' :
      'Excellent for large offsets. High effectiveness and quick results.',
    
    'cookstove': co2Tons < 1 ?
      'Perfect for small offsets. Provides health and environmental benefits.' :
      'Great for medium offsets. Improves lives while reducing emissions.',
    
    'forest-conservation': co2Tons < 1.5 ?
      'Good for medium offsets. Protects existing carbon stores.' :
      'Ideal for large offsets. Prevents future emissions and protects biodiversity.'
  };

  return recommendations[type] || 'This project type provides effective carbon offsetting.';
}

/**
 * Get free offset resources and providers
 * @returns {Object} Free offset resources
 */
function getOffsetProviders() {
  return {
    resources: FREE_OFFSET_RESOURCES,
    categories: {
      calculators: FREE_OFFSET_RESOURCES.filter(r => r.type === 'calculator'),
      providers: FREE_OFFSET_RESOURCES.filter(r => r.type === 'provider'),
      standards: FREE_OFFSET_RESOURCES.filter(r => r.type === 'standard')
    },
    summary: {
      totalResources: FREE_OFFSET_RESOURCES.length,
      calculators: FREE_OFFSET_RESOURCES.filter(r => r.type === 'calculator').length,
      providers: FREE_OFFSET_RESOURCES.filter(r => r.type === 'provider').length,
      standards: FREE_OFFSET_RESOURCES.filter(r => r.type === 'standard').length
    }
  };
}

/**
 * Calculate offset impact equivalences
 * @param {number} co2Kg - CO₂ amount in kg
 * @returns {Object} Impact equivalences
 */
function calculateOffsetEquivalences(co2Kg) {
  const co2Tons = co2Kg / 1000;
  
  return {
    co2Kg,
    co2Tons: Math.round(co2Tons * 1000) / 1000,
    equivalences: {
      treesPlanted: Math.round(co2Tons * 0.5), // Rough estimate
      carMilesOffset: Math.round(co2Tons * 2200), // 1 ton CO₂ ≈ 2200 car miles
      flightsOffset: Math.round(co2Tons * 0.4), // 1 ton CO₂ ≈ 0.4 short flights
      electricityOffset: Math.round(co2Tons * 1200), // 1 ton CO₂ ≈ 1200 kWh
      gasolineOffset: Math.round(co2Tons * 100), // 1 ton CO₂ ≈ 100 gallons
      homeEnergyOffset: Math.round(co2Tons * 0.05) // 1 ton CO₂ ≈ 0.05 homes for a year
    },
    impact: {
      description: `Offsetting ${co2Kg} kg of CO₂ is equivalent to:`,
      benefits: [
        'Reducing atmospheric CO₂ levels',
        'Supporting sustainable development',
        'Contributing to climate action',
        'Supporting local communities',
        'Protecting biodiversity'
      ]
    }
  };
}

/**
 * Get educational content about carbon offsets
 * @returns {Object} Educational content
 */
function getEducationalContent() {
  return {
    whatAreOffsets: {
      title: 'What are Carbon Offsets?',
      content: 'Carbon offsets are credits for verified reductions in greenhouse gas emissions made to compensate for emissions produced elsewhere. They represent a reduction of one metric ton of CO₂ or its equivalent in other greenhouse gases.',
      keyPoints: [
        'Verified by third-party standards',
        'Additional to business-as-usual',
        'Permanent and measurable',
        'Support sustainable development'
      ]
    },
    howTheyWork: {
      title: 'How Carbon Offsets Work',
      content: 'When you purchase a carbon offset, you are funding a project that reduces, avoids, or removes greenhouse gas emissions from the atmosphere. These projects are verified by independent standards to ensure they deliver real environmental benefits.',
      steps: [
        'Calculate your carbon footprint',
        'Choose verified offset projects',
        'Purchase carbon credits',
        'Projects reduce/remove emissions',
        'Third-party verification ensures quality'
      ]
    },
    typesOfProjects: {
      title: 'Types of Offset Projects',
      content: 'Carbon offset projects fall into several categories, each with different benefits and characteristics.',
      categories: Object.entries(OFFSET_PROJECTS).map(([type, project]) => ({
        type,
        name: project.name,
        description: project.description,
        benefits: project.coBenefits,
        costRange: `$${project.costPerTon}/ton CO₂`
      }))
    },
    choosingProjects: {
      title: 'Choosing the Right Projects',
      content: 'When selecting carbon offset projects, consider factors like cost, effectiveness, co-benefits, and verification standards.',
      criteria: [
        'Third-party verification (Gold Standard, VCS)',
        'Additionality (would not happen without funding)',
        'Permanence (long-term impact)',
        'Co-benefits (social, environmental)',
        'Transparency and reporting'
      ]
    }
  };
}

module.exports = {
  calculateOffsetCost,
  suggestProjects,
  getOffsetProviders,
  calculateOffsetEquivalences,
  getEducationalContent,
  OFFSET_PROJECTS,
  FREE_OFFSET_RESOURCES
};
