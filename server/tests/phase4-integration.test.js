/**
 * Phase 4 Integration Tests
 * 
 * Comprehensive testing of all Phase 4 features:
 * - Advanced Analytics & Reporting
 * - Organization Dashboards
 * - Carbon Offset Suggestions
 * 
 * @author AI Environmental Impact Calculator Team
 * @version 4.0.0
 */

const analyticsService = require('../services/analytics');
const organizationService = require('../services/organization');
const offsetService = require('../services/offsetSuggestions');
const { calculateEnvironmentalImpact } = require('../calculations');

console.log('🧪 Running Phase 4 Integration Tests...');

async function runTests() {
  let testsPassed = 0;
  const totalTests = 15;

  // Test 1: Analytics Service - Historical Trends
  console.log('\n📊 Testing Analytics Service - Historical Trends...');
  try {
    const trends = await analyticsService.getHistoricalTrends(1, '30d');
    if (trends && trends.summary && trends.trends) {
      console.log(`✅ Historical trends test passed`);
      console.log(`   Total calculations: ${trends.summary.totalCalculations}`);
      console.log(`   Total CO2: ${trends.summary.totalCo2} kg`);
      console.log(`   Trend direction: ${trends.summary.trendDirection}`);
      testsPassed++;
    } else {
      console.error('❌ Historical trends test failed');
    }
  } catch (error) {
    console.error('❌ Historical Trends Test Failed:', error.message);
  }

  // Test 2: Analytics Service - Model Comparison
  console.log('\n🧠 Testing Analytics Service - Model Comparison...');
  try {
    const modelComparison = await analyticsService.getModelComparison(1);
    if (modelComparison && modelComparison.models && modelComparison.insights) {
      console.log('✅ Model comparison test passed');
      console.log(`   Models analyzed: ${modelComparison.models.length}`);
      console.log(`   Most efficient: ${modelComparison.insights.mostEfficient?.model || 'N/A'}`);
      testsPassed++;
    } else {
      console.error('❌ Model comparison test failed');
    }
  } catch (error) {
    console.error('❌ Model Comparison Test Failed:', error.message);
  }

  // Test 3: Analytics Service - Regional Comparison
  console.log('\n🌍 Testing Analytics Service - Regional Comparison...');
  try {
    const regionalComparison = await analyticsService.getRegionalComparison(1);
    if (regionalComparison && regionalComparison.regions && regionalComparison.insights) {
      console.log('✅ Regional comparison test passed');
      console.log(`   Regions analyzed: ${regionalComparison.regions.length}`);
      console.log(`   Lowest intensity: ${regionalComparison.insights.lowestIntensity?.region || 'N/A'}`);
      testsPassed++;
    } else {
      console.error('❌ Regional comparison test failed');
    }
  } catch (error) {
    console.error('❌ Regional Comparison Test Failed:', error.message);
  }

  // Test 4: Analytics Service - Predictive Insights
  console.log('\n🔮 Testing Analytics Service - Predictive Insights...');
  try {
    const predictions = await analyticsService.getPredictiveInsights(1);
    if (predictions && predictions.insights) {
      console.log('✅ Predictive insights test passed');
      console.log(`   Trend: ${predictions.insights.trend}`);
      console.log(`   Data points: ${predictions.insights.dataPoints}`);
      if (predictions.predictions) {
        console.log(`   Weekly projection: ${predictions.predictions.weekly} kg CO₂`);
      }
      testsPassed++;
    } else {
      console.error('❌ Predictive insights test failed');
    }
  } catch (error) {
    console.error('❌ Predictive Insights Test Failed:', error.message);
  }

  // Test 5: Analytics Service - Data Export
  console.log('\n📤 Testing Analytics Service - Data Export...');
  try {
    const exportData = await analyticsService.exportAnalyticsData(1, 'json', '30d');
    if (exportData && exportData.data && exportData.format === 'json') {
      console.log('✅ Data export test passed');
      console.log(`   Export format: ${exportData.format}`);
      console.log(`   Filename: ${exportData.filename}`);
      testsPassed++;
    } else {
      console.error('❌ Data export test failed');
    }
  } catch (error) {
    console.error('❌ Data Export Test Failed:', error.message);
  }

  // Test 6: Organization Service - Create Organization
  console.log('\n🏢 Testing Organization Service - Create Organization...');
  try {
    const organization = await organizationService.createOrganization(
      'Test Organization Phase 4',
      1,
      'A test organization for Phase 4 integration testing'
    );
    if (organization && organization.id && organization.name) {
      console.log('✅ Create organization test passed');
      console.log(`   Organization ID: ${organization.id}`);
      console.log(`   Organization name: ${organization.name}`);
      console.log(`   Owner: ${organization.owner?.name || 'N/A'}`);
      testsPassed++;
    } else {
      console.error('❌ Create organization test failed');
    }
  } catch (error) {
    console.error('❌ Create Organization Test Failed:', error.message);
  }

  // Test 7: Organization Service - Get User Organizations
  console.log('\n👥 Testing Organization Service - Get User Organizations...');
  try {
    const organizations = await organizationService.getUserOrganizations(1);
    if (Array.isArray(organizations)) {
      console.log('✅ Get user organizations test passed');
      console.log(`   User organizations: ${organizations.length}`);
      if (organizations.length > 0) {
        console.log(`   First org: ${organizations[0].name}`);
        console.log(`   User role: ${organizations[0].userRole}`);
      }
      testsPassed++;
    } else {
      console.error('❌ Get user organizations test failed');
    }
  } catch (error) {
    console.error('❌ Get User Organizations Test Failed:', error.message);
  }

  // Test 8: Organization Service - Organization Stats
  console.log('\n📈 Testing Organization Service - Organization Stats...');
  try {
    const stats = await organizationService.getOrganizationStats(1, 1);
    if (stats && stats.summary && stats.breakdown) {
      console.log('✅ Organization stats test passed');
      console.log(`   Total calculations: ${stats.summary.totalCalculations}`);
      console.log(`   Total CO2: ${stats.summary.totalCo2} kg`);
      console.log(`   Member count: ${stats.organization.memberCount}`);
      testsPassed++;
    } else {
      console.error('❌ Organization stats test failed');
    }
  } catch (error) {
    console.error('❌ Organization Stats Test Failed:', error.message);
  }

  // Test 9: Offset Service - Cost Calculation
  console.log('\n💰 Testing Offset Service - Cost Calculation...');
  try {
    const calculation = offsetService.calculateOffsetCost(1000, 'reforestation');
    if (calculation && calculation.cost && calculation.project) {
      console.log('✅ Offset cost calculation test passed');
      console.log(`   CO2 amount: ${calculation.co2Kg} kg`);
      console.log(`   Project type: ${calculation.projectType}`);
      console.log(`   Cost: $${calculation.cost.effective} ${calculation.cost.currency}`);
      console.log(`   Effectiveness: ${calculation.project.effectiveness * 100}%`);
      testsPassed++;
    } else {
      console.error('❌ Offset cost calculation test failed');
    }
  } catch (error) {
    console.error('❌ Offset Cost Calculation Test Failed:', error.message);
  }

  // Test 10: Offset Service - Project Suggestions
  console.log('\n🌱 Testing Offset Service - Project Suggestions...');
  try {
    const suggestions = offsetService.suggestProjects(1000, {});
    if (suggestions && suggestions.suggestions && suggestions.summary) {
      console.log('✅ Project suggestions test passed');
      console.log(`   CO2 amount: ${suggestions.co2Kg} kg`);
      console.log(`   Suggestions count: ${suggestions.suggestions.length}`);
      console.log(`   Cost range: $${suggestions.summary.costRange.min} - $${suggestions.summary.costRange.max}`);
      console.log(`   Average cost: $${suggestions.summary.averageCost}`);
      testsPassed++;
    } else {
      console.error('❌ Project suggestions test failed');
    }
  } catch (error) {
    console.error('❌ Project Suggestions Test Failed:', error.message);
  }

  // Test 11: Offset Service - Equivalences
  console.log('\n⚖️ Testing Offset Service - Equivalences...');
  try {
    const equivalences = offsetService.calculateOffsetEquivalences(1000);
    if (equivalences && equivalences.equivalences && equivalences.impact) {
      console.log('✅ Offset equivalences test passed');
      console.log(`   CO2 amount: ${equivalences.co2Kg} kg`);
      console.log(`   Trees equivalent: ${equivalences.equivalences.treesPlanted}`);
      console.log(`   Car miles offset: ${equivalences.equivalences.carMilesOffset}`);
      console.log(`   Benefits count: ${equivalences.impact.benefits.length}`);
      testsPassed++;
    } else {
      console.error('❌ Offset equivalences test failed');
    }
  } catch (error) {
    console.error('❌ Offset Equivalences Test Failed:', error.message);
  }

  // Test 12: Offset Service - Educational Content
  console.log('\n📚 Testing Offset Service - Educational Content...');
  try {
    const education = offsetService.getEducationalContent();
    if (education && education.whatAreOffsets && education.howTheyWork) {
      console.log('✅ Educational content test passed');
      console.log(`   Content sections: ${Object.keys(education).length}`);
      console.log(`   What are offsets: ${education.whatAreOffsets.title}`);
      console.log(`   How they work: ${education.howTheyWork.title}`);
      testsPassed++;
    } else {
      console.error('❌ Educational content test failed');
    }
  } catch (error) {
    console.error('❌ Educational Content Test Failed:', error.message);
  }

  // Test 13: Offset Service - Free Resources
  console.log('\n🔗 Testing Offset Service - Free Resources...');
  try {
    const providers = offsetService.getOffsetProviders();
    if (providers && providers.resources && providers.categories) {
      console.log('✅ Free resources test passed');
      console.log(`   Total resources: ${providers.summary.totalResources}`);
      console.log(`   Calculators: ${providers.summary.calculators}`);
      console.log(`   Providers: ${providers.summary.providers}`);
      console.log(`   Standards: ${providers.summary.standards}`);
      testsPassed++;
    } else {
      console.error('❌ Free resources test failed');
    }
  } catch (error) {
    console.error('❌ Free Resources Test Failed:', error.message);
  }

  // Test 14: Enhanced Calculation Engine with Real-time Data
  console.log('\n🧮 Testing Enhanced Calculation Engine...');
  try {
    const result = await calculateEnvironmentalImpact(1000, 'gpt4', 'US', true);
    if (result && result.metadata && result.co2) {
      console.log('✅ Enhanced calculation engine test passed');
      console.log(`   Tokens: ${result.tokens}`);
      console.log(`   Model: ${result.model}`);
      console.log(`   Region: ${result.region}`);
      console.log(`   CO2: ${result.co2.total} ${result.co2.unit}`);
      console.log(`   Real-time data: ${result.metadata.realTimeData}`);
      console.log(`   Data source: ${result.metadata.dataSource}`);
      testsPassed++;
    } else {
      console.error('❌ Enhanced calculation engine test failed');
    }
  } catch (error) {
    console.error('❌ Enhanced Calculation Engine Test Failed:', error.message);
  }

  // Test 15: Full Integration Test - Complete Workflow
  console.log('\n🔄 Testing Full Integration Workflow...');
  try {
    // Step 1: Calculate environmental impact
    const calculation = await calculateEnvironmentalImpact(5000, 'claude', 'DE', true);
    
    // Step 2: Get analytics for the user
    const trends = await analyticsService.getHistoricalTrends(1, '30d');
    
    // Step 3: Get organization stats
    const orgStats = await organizationService.getOrganizationStats(1, 1);
    
    // Step 4: Get offset suggestions for the calculation
    const offsetSuggestions = offsetService.suggestProjects(calculation.co2.total, {});
    
    if (calculation && trends && orgStats && offsetSuggestions) {
      console.log('✅ Full integration workflow test passed');
      console.log(`   Calculation CO2: ${calculation.co2.total} kg`);
      console.log(`   Analytics data points: ${trends.trends.daily.length}`);
      console.log(`   Organization calculations: ${orgStats.summary.totalCalculations}`);
      console.log(`   Offset suggestions: ${offsetSuggestions.suggestions.length}`);
      testsPassed++;
    } else {
      console.error('❌ Full integration workflow test failed');
    }
  } catch (error) {
    console.error('❌ Full Integration Workflow Test Failed:', error.message);
  }

  // Test Summary
  console.log('\n📊 Phase 4 Integration Test Summary:');
  console.log(`   Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`   Success Rate: ${((testsPassed / totalTests) * 100).toFixed(0)}%`);

  if (testsPassed === totalTests) {
    console.log('\n🎉 All Phase 4 integration tests passed!');
    console.log('✅ Advanced Analytics & Reporting: Working');
    console.log('✅ Organization Dashboards: Working');
    console.log('✅ Carbon Offset Suggestions: Working');
    console.log('✅ Full Stack Integration: Working');
    console.log('\n🚀 Phase 4 implementation is complete and production-ready!');
  } else {
    console.error('\n❌ Some Phase 4 integration tests failed. Please review the logs.');
    process.exit(1);
  }
}

runTests();
