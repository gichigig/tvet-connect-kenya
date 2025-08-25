require('dotenv').config();

// Use global fetch (available in Node.js 18+)
const fetch = globalThis.fetch;

async function testCorrectEndpoints() {
    const API_BASE_URL = process.env.VITE_API_BASE_URL;
    const API_KEY = process.env.VITE_API_KEY;
    
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    };
    
    console.log('🔍 Testing with correct endpoints...');
    
    try {
        // First, get all units to see what's available
        console.log('\n1. Getting all available units...');
        const unitsResponse = await fetch(`${API_BASE_URL}/api/units`, {
            method: 'GET',
            headers
        });
        
        if (unitsResponse.ok) {
            const unitsData = await unitsResponse.json();
            console.log(`✅ Found ${unitsData.units?.length || 0} units:`);
            
            if (unitsData.units && unitsData.units.length > 0) {
                unitsData.units.forEach((unit, index) => {
                    console.log(`  ${index + 1}. ${unit.code} - ${unit.name} (ID: ${unit.id})`);
                });
                
                // Test semester plan for the first few units
                console.log('\n2. Testing semester plans for available units...');
                
                for (let i = 0; i < Math.min(3, unitsData.units.length); i++) {
                    const unit = unitsData.units[i];
                    console.log(`\n   Testing unit: ${unit.code} (${unit.id})`);
                    
                    const planResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${unit.id}`, {
                        method: 'GET',
                        headers
                    });
                    
                    console.log(`   Response status: ${planResponse.status}`);
                    
                    if (planResponse.ok) {
                        const planData = await planResponse.json();
                        console.log('   ✅ Semester plan found!');
                        console.log(`   - Week plans: ${planData.plan?.weekPlans?.length || 0}`);
                        console.log(`   - Semester weeks: ${planData.plan?.semesterWeeks || 0}`);
                        
                        // Check for visible materials
                        const visibleMaterials = planData.plan?.weekPlans?.reduce((total, week) => {
                            return total + (week.materials?.filter(m => m.isVisible)?.length || 0);
                        }, 0) || 0;
                        console.log(`   - Visible materials: ${visibleMaterials}`);
                    } else {
                        console.log('   ❌ No semester plan found');
                    }
                }
                
                // Test our specific unit we created
                console.log('\n3. Testing our newly created unit...');
                const ourUnitResponse = await fetch(`${API_BASE_URL}/api/semester/plans/tnD7GvGz6Mahq7lGGQKC`, {
                    method: 'GET',
                    headers
                });
                
                console.log(`Our unit response status: ${ourUnitResponse.status}`);
                
                if (ourUnitResponse.ok) {
                    const ourPlanData = await ourUnitResponse.json();
                    console.log('✅ Our semester plan found!');
                    console.log('Plan details:', {
                        weekPlans: ourPlanData.plan?.weekPlans?.length,
                        semesterWeeks: ourPlanData.plan?.semesterWeeks,
                        visibleMaterials: ourPlanData.plan?.weekPlans?.reduce((total, week) => {
                            return total + (week.materials?.filter(m => m.isVisible)?.length || 0);
                        }, 0)
                    });
                } else {
                    console.log('❌ Our semester plan not found');
                    const errorText = await ourUnitResponse.text();
                    console.log('Error:', errorText);
                }
            }
        } else {
            console.log('❌ Failed to get units');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCorrectEndpoints();
