require('dotenv').config();

// Use global fetch (available in Node.js 18+)
const fetch = globalThis.fetch;

async function testNewData() {
    const API_BASE_URL = process.env.VITE_API_BASE_URL;
    const API_KEY = process.env.VITE_API_KEY;
    
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    };
    
    console.log('🔍 Testing newly created data...');
    console.log('Unit ID to test: tnD7GvGz6Mahq7lGGQKC');
    console.log('Plan ID to test: acdj9tVQE7ZrmWcTqAOh');
    
    try {
        // Test specific semester plan
        console.log('\n1. Testing specific semester plan...');
        const planResponse = await fetch(`${API_BASE_URL}/api/semester-plans/tnD7GvGz6Mahq7lGGQKC`, {
            method: 'GET',
            headers
        });
        
        console.log('Plan response status:', planResponse.status);
        
        if (planResponse.ok) {
            const planData = await planResponse.json();
            console.log('✅ Semester plan found!');
            console.log('Plan details:', {
                id: planData.plan?.id,
                unitId: planData.plan?.unitId,
                weekPlans: planData.plan?.weekPlans?.length,
                semesterWeeks: planData.plan?.semesterWeeks
            });
        } else {
            console.log('❌ Semester plan not found');
            const errorText = await planResponse.text();
            console.log('Error:', errorText);
        }
        
        // Test units endpoint with proper authentication
        console.log('\n2. Testing units endpoint...');
        const unitsResponse = await fetch(`${API_BASE_URL}/api/units`, {
            method: 'GET',
            headers
        });
        
        console.log('Units response status:', unitsResponse.status);
        
        if (unitsResponse.ok) {
            const unitsData = await unitsResponse.json();
            console.log('Units found:', unitsData.units?.length || 0);
            
            if (unitsData.units && unitsData.units.length > 0) {
                console.log('First unit:', {
                    id: unitsData.units[0].id,
                    code: unitsData.units[0].code,
                    name: unitsData.units[0].name
                });
            }
        } else {
            console.log('❌ Units endpoint failed');
            const errorText = await unitsResponse.text();
            console.log('Error:', errorText);
        }
        
        // Test if we can find our specific unit by ID
        console.log('\n3. Testing specific unit by ID...');
        const unitResponse = await fetch(`${API_BASE_URL}/api/units/tnD7GvGz6Mahq7lGGQKC`, {
            method: 'GET',
            headers
        });
        
        console.log('Unit response status:', unitResponse.status);
        
        if (unitResponse.ok) {
            const unitData = await unitResponse.json();
            console.log('✅ Unit found!');
            console.log('Unit details:', {
                id: unitData.unit?.id,
                code: unitData.unit?.code,
                name: unitData.unit?.name
            });
        } else {
            console.log('❌ Specific unit not found');
            const errorText = await unitResponse.text();
            console.log('Error:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNewData();
