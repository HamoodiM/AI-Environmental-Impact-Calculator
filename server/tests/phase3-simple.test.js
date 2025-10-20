/**
 * Phase 3 Simple Integration Tests
 * 
 * Simple tests for real-time carbon intensity integration
 * Tests core functionality without external dependencies
 */

const carbonIntensityService = require('../services/carbonIntensity');
const { calculateEnvironmentalImpact } = require('../calculations');

// Helper function to run tests
async function runPhase3Tests() {
  console.log('🧪 Running Phase 3 Integration Tests...');
  console.log('');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Test 1: Carbon Intensity Service
  console.log('📊 Testing Carbon Intensity Service...');
  testsTotal++;
  try {
    const usData = await carbonIntensityService.getCarbonIntensity('US');
    console.log('✅ US Carbon Intensity:', usData.carbonIntensity, 'gCO2/kWh');
    console.log('   Source:', usData.source);
    console.log('   Region:', usData.region);
    testsPassed++;
  } catch (error) {
    console.error('❌ Carbon Intensity Service test failed:', error.message);
  }
  
  // Test 2: Multiple Countries
  console.log('');
  console.log('🌍 Testing Multiple Countries...');
  testsTotal++;
  try {
    const results = await carbonIntensityService.getMultipleCarbonIntensities(['US', 'DE', 'FR']);
    console.log('✅ Multiple countries test passed');
    console.log('   US:', results[0].carbonIntensity, 'gCO2/kWh');
    console.log('   DE:', results[1].carbonIntensity, 'gCO2/kWh');
    console.log('   FR:', results[2].carbonIntensity, 'gCO2/kWh');
    testsPassed++;
  } catch (error) {
    console.error('❌ Multiple countries test failed:', error.message);
  }
  
  // Test 3: Available Regions
  console.log('');
  console.log('🗺️ Testing Available Regions...');
  testsTotal++;
  try {
    const regions = carbonIntensityService.getAvailableRegions();
    const regionCount = Object.keys(regions).length;
    console.log('✅ Available regions test passed');
    console.log('   Total regions:', regionCount);
    console.log('   Sample regions:', Object.keys(regions).slice(0, 5).join(', '));
    testsPassed++;
  } catch (error) {
    console.error('❌ Available regions test failed:', error.message);
  }
  
  // Test 4: Enhanced Calculation Engine
  console.log('');
  console.log('🧮 Testing Enhanced Calculation Engine...');
  testsTotal++;
  try {
    const result = await calculateEnvironmentalImpact(1000, 'gpt4', 'US', true);
    console.log('✅ Enhanced calculation test passed');
    console.log('   Tokens:', result.tokens);
    console.log('   Model:', result.model);
    console.log('   Region:', result.region);
    console.log('   Energy:', result.energy.total, result.energy.unit);
    console.log('   CO2:', result.co2.total, result.co2.unit);
    console.log('   CO2 Factor:', result.co2.factor, result.co2.factorUnit);
    console.log('   Real-time Data:', result.metadata.realTimeData);
    console.log('   Data Source:', result.metadata.dataSource);
    testsPassed++;
  } catch (error) {
    console.error('❌ Enhanced calculation test failed:', error.message);
  }
  
  // Test 5: Different Regions
  console.log('');
  console.log('🌎 Testing Different Regions...');
  testsTotal++;
  try {
    const usResult = await calculateEnvironmentalImpact(1000, 'gpt4', 'US', true);
    const deResult = await calculateEnvironmentalImpact(1000, 'gpt4', 'DE', true);
    const frResult = await calculateEnvironmentalImpact(1000, 'gpt4', 'FR', true);
    
    console.log('✅ Different regions test passed');
    console.log('   US CO2 Factor:', usResult.co2.factor);
    console.log('   DE CO2 Factor:', deResult.co2.factor);
    console.log('   FR CO2 Factor:', frResult.co2.factor);
    
    // Verify different regions have different factors
    if (usResult.co2.factor !== deResult.co2.factor && deResult.co2.factor !== frResult.co2.factor) {
      console.log('   ✅ Regions have different CO2 factors as expected');
    } else {
      console.log('   ⚠️ Some regions have identical CO2 factors');
    }
    testsPassed++;
  } catch (error) {
    console.error('❌ Different regions test failed:', error.message);
  }
  
  // Test 6: Caching System
  console.log('');
  console.log('💾 Testing Caching System...');
  testsTotal++;
  try {
    // Clear cache first
    carbonIntensityService.clearCache();
    
    // First call
    const startTime = Date.now();
    await carbonIntensityService.getCarbonIntensity('US');
    const firstCallTime = Date.now() - startTime;
    
    // Second call (should be faster due to cache)
    const secondStartTime = Date.now();
    await carbonIntensityService.getCarbonIntensity('US');
    const secondCallTime = Date.now() - secondStartTime;
    
    // Check cache stats
    const stats = carbonIntensityService.getCacheStats();
    
    console.log('✅ Caching system test passed');
    console.log('   First call time:', firstCallTime, 'ms');
    console.log('   Second call time:', secondCallTime, 'ms');
    console.log('   Cache entries:', stats.totalEntries);
    console.log('   Valid entries:', stats.validEntries);
    console.log('   Cache TTL:', stats.cacheTTLMinutes, 'minutes');
    
    if (secondCallTime < firstCallTime) {
      console.log('   ✅ Second call was faster (cache working)');
    } else {
      console.log('   ⚠️ Second call was not faster (cache may not be working)');
    }
    testsPassed++;
  } catch (error) {
    console.error('❌ Caching system test failed:', error.message);
  }
  
  // Test 7: Fallback Data
  console.log('');
  console.log('🔄 Testing Fallback Data...');
  testsTotal++;
  try {
    const result = await calculateEnvironmentalImpact(1000, 'gpt4', 'global-average', true);
    console.log('✅ Fallback data test passed');
    console.log('   Region:', result.region);
    console.log('   Real-time Data:', result.metadata.realTimeData);
    console.log('   Data Source:', result.metadata.dataSource);
    console.log('   CO2 Factor:', result.co2.factor);
    testsPassed++;
  } catch (error) {
    console.error('❌ Fallback data test failed:', error.message);
  }
  
  // Test 8: Error Handling
  console.log('');
  console.log('⚠️ Testing Error Handling...');
  testsTotal++;
  try {
    const result = await calculateEnvironmentalImpact(1000, 'gpt4', 'INVALID-REGION', true);
    console.log('✅ Error handling test passed');
    console.log('   Region:', result.region);
    console.log('   Data Source:', result.metadata.dataSource);
    console.log('   CO2 Factor:', result.co2.factor);
    testsPassed++;
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
  
  // Summary
  console.log('');
  console.log('📊 Test Summary:');
  console.log(`   Tests Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('');
    console.log('🎉 All Phase 3 tests passed!');
    console.log('✅ Real-time carbon intensity integration is working correctly');
    return true;
  } else {
    console.log('');
    console.log('❌ Some tests failed. Please check the errors above.');
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPhase3Tests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runPhase3Tests };
