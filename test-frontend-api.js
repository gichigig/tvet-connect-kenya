// Test frontend API integration
import { SemesterPlanAPI } from './src/integrations/api/semesterPlanAPI.js';

console.log('🧪 Testing Frontend API Integration...\n');

async function testFrontendAPI() {
  try {
    console.log('1. Testing API configuration...');
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001');
    console.log('API Key:', import.meta.env.VITE_API_KEY ? 'Present' : 'Missing');
    
    console.log('\n2. Testing semester plan fetch (should return empty plan)...');
    const plan = await SemesterPlanAPI.getSemesterPlan('frontend-test-unit');
    console.log('✅ Fetch successful:', plan);
    
    console.log('\n3. Testing semester plan save...');
    const testPlan = {
      semesterStart: '2025-02-10',
      semesterWeeks: 12,
      weekPlans: []
    };
    
    const saveResult = await SemesterPlanAPI.saveSemesterPlan('frontend-test-unit', testPlan);
    console.log('✅ Save successful:', saveResult);
    
    console.log('\n4. Testing semester plan fetch after save...');
    const updatedPlan = await SemesterPlanAPI.getSemesterPlan('frontend-test-unit');
    console.log('✅ Updated plan:', updatedPlan);
    
    console.log('\n🎉 All frontend API tests passed!');
    
  } catch (error) {
    console.error('❌ Frontend API test failed:', error.message);
    console.error('Full error:', error);
  }
}

testFrontendAPI();
