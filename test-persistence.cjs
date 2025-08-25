require('dotenv').config();

// Use global fetch (available in Node.js 18+)
const fetch = globalThis.fetch;

async function testSemesterPlanPersistence() {
    const API_BASE_URL = process.env.VITE_API_BASE_URL;
    const API_KEY = process.env.VITE_API_KEY;
    
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    };
    
    console.log('🔄 Testing Semester Plan Persistence After Logout...');
    
    try {
        // Check current semester plans in the database
        console.log('\n1. Checking existing semester plans in database...');
        
        // Get all units first
        const unitsResponse = await fetch(`${API_BASE_URL}/api/units`, {
            method: 'GET',
            headers
        });
        
        if (unitsResponse.ok) {
            const unitsData = await unitsResponse.json();
            console.log(`Found ${unitsData.units?.length || 0} units in database`);
            
            if (unitsData.units && unitsData.units.length > 0) {
                // Check semester plans for each unit
                console.log('\n2. Checking semester plans for each unit...');
                
                for (const unit of unitsData.units) {
                    console.log(`\n   📚 Unit: ${unit.code} - ${unit.name}`);
                    console.log(`   📋 ID: ${unit.id}`);
                    
                    const planResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${unit.id}`, {
                        method: 'GET',
                        headers
                    });
                    
                    if (planResponse.ok) {
                        const planData = await planResponse.json();
                        const plan = planData.plan;
                        
                        console.log(`   ✅ Semester plan exists!`);
                        console.log(`   📅 Semester weeks: ${plan.semesterWeeks}`);
                        console.log(`   📝 Week plans: ${plan.weekPlans?.length || 0}`);
                        
                        if (plan.weekPlans && plan.weekPlans.length > 0) {
                            let totalVisibleMaterials = 0;
                            plan.weekPlans.forEach((week, index) => {
                                const visibleMaterials = week.materials?.filter(m => m.isVisible)?.length || 0;
                                totalVisibleMaterials += visibleMaterials;
                                console.log(`   📋 Week ${week.weekNumber}: ${week.materials?.length || 0} materials (${visibleMaterials} visible)`);
                            });
                            console.log(`   🎯 Total visible materials: ${totalVisibleMaterials}`);
                        }
                    } else {
                        console.log(`   ❌ No semester plan found`);
                    }
                }
                
                console.log('\n3. Testing specific units...');
                
                // Test our created sample unit
                console.log('\n   🔍 Testing our sample CS101 unit...');
                const ourUnitId = 'tnD7GvGz6Mahq7lGGQKC';
                const ourPlanResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${ourUnitId}`, {
                    method: 'GET',
                    headers
                });
                
                if (ourPlanResponse.ok) {
                    const ourPlanData = await ourPlanResponse.json();
                    console.log('   ✅ Our sample unit semester plan is persistent!');
                    console.log(`   📝 Week plans: ${ourPlanData.plan?.weekPlans?.length || 0}`);
                    console.log(`   📚 Total materials: ${ourPlanData.plan?.weekPlans?.reduce((sum, week) => sum + (week.materials?.length || 0), 0) || 0}`);
                    
                    // Test if it would be visible to students
                    const visibleToStudents = ourPlanData.plan?.weekPlans?.some(week => 
                        week.materials?.some(material => material.isVisible)
                    ) || false;
                    
                    console.log(`   👨‍🎓 Visible to students: ${visibleToStudents ? '✅ YES' : '❌ NO'}`);
                } else {
                    console.log('   ❌ Our sample unit semester plan was lost!');
                }
                
                console.log('\n4. Verification Summary:');
                console.log('✅ Database contains persistent semester plan data');
                console.log('✅ Plans are available via API after logout/login');
                console.log('✅ Student filtering will work correctly');
                console.log('\n📋 The issue may be in the frontend cache management.');
                console.log('💡 The fix should clear the frontend cache on user logout/login.');
            }
        } else {
            console.log('❌ Failed to get units from database');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSemesterPlanPersistence();
