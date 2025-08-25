// Debug API connection for semester plans
import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_KEY = process.env.VITE_API_KEY;

console.log('🔍 Debugging API Connection...');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('API_KEY:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('');

async function testConnection() {
  try {
    // Test basic API connection
    console.log('1. Testing basic API connection...');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
      },
    });
    
    if (response.ok) {
      console.log('✅ API server is reachable');
    } else {
      console.log('❌ API server not reachable:', response.status);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }

  try {
    // Test semester plan endpoint with a test unit ID
    console.log('\n2. Testing semester plan GET endpoint...');
    const testUnitId = 'test-unit-123';
    
    const response = await fetch(`${API_BASE_URL}/api/semester/plans/${testUnitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.status === 404) {
      console.log('✅ Endpoint is working (404 expected for non-existent unit)');
    } else if (response.ok) {
      console.log('✅ Endpoint is working and found data');
    } else if (response.status === 403) {
      console.log('❌ Permission denied - API key lacks semester:read permission');
    } else if (response.status === 401) {
      console.log('❌ Unauthorized - Invalid API key');
    } else {
      console.log('❌ Unexpected response:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Request error:', error.message);
  }

  try {
    // Test getting all units to see what actually exists
    console.log('\n3. Testing units endpoint to find real unit IDs...');
    
    const response = await fetch(`${API_BASE_URL}/api/units`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Units endpoint working');
      console.log('Units found:', data.length || 0);
      
      if (data.length > 0) {
        const firstUnit = data[0];
        console.log('First unit:', firstUnit.id, '-', firstUnit.code);
        
        // Test semester plan with real unit ID
        console.log('\n4. Testing semester plan with real unit ID:', firstUnit.id);
        
        const planResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${firstUnit.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
          },
        });
        
        console.log('Plan response status:', planResponse.status);
        const planData = await planResponse.json();
        console.log('Plan response data:', planData);
        
        if (planResponse.status === 404) {
          console.log('ℹ️ No semester plan created yet for this unit');
        } else if (planResponse.ok) {
          console.log('✅ Found semester plan!');
          console.log('Week plans:', planData.plan?.weekPlans?.length || 0);
        }
      }
    } else {
      console.log('❌ Units endpoint failed:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Units request error:', error.message);
  }

  try {
    // Check if there are semester plans in the database
    console.log('\n5. Checking if any semester plans exist in database...');
    
    // This is a simplified check - in real scenario we'd need a different endpoint
    // For now, let's create a test semester plan and see if it works
    console.log('Creating a test semester plan...');
    
    const testPlan = {
      semesterStart: '2025-02-01T00:00:00.000Z',
      semesterWeeks: 15,
      weekPlans: [
        {
          weekNumber: 1,
          startDate: '2025-02-01T00:00:00.000Z',
          endDate: '2025-02-07T23:59:59.000Z',
          weekMessage: 'Test Week 1',
          materials: [
            {
              id: 'test-material-1',
              title: 'Test Material',
              description: 'Test description',
              isVisible: true
            }
          ],
          assignments: [],
          exams: []
        }
      ]
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/api/semester/plans/test-unit-123`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(testPlan)
    });
    
    if (createResponse.ok) {
      console.log('✅ Test semester plan created successfully');
      
      // Now try to retrieve it
      const getResponse = await fetch(`${API_BASE_URL}/api/semester/plans/test-unit-123`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      });
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        console.log('✅ Test semester plan retrieved successfully');
        console.log('Retrieved plan weeks:', data.plan?.weekPlans?.length || 0);
        console.log('First week materials:', data.plan?.weekPlans?.[0]?.materials?.length || 0);
      } else {
        console.log('❌ Failed to retrieve test plan:', getResponse.status);
      }
    } else {
      const errorData = await createResponse.json();
      console.log('❌ Failed to create test plan:', createResponse.status, errorData);
    }
    
  } catch (error) {
    console.log('❌ Test plan error:', error.message);
  }
}

testConnection();
