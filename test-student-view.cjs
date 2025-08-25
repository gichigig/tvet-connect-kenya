require('dotenv').config();

// Use global fetch (available in Node.js 18+)
const fetch = globalThis.fetch;

async function testStudentView() {
    const API_BASE_URL = process.env.VITE_API_BASE_URL;
    const API_KEY = process.env.VITE_API_KEY;
    
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    };
    
    console.log('🎓 Testing Student Semester Plan View...');
    
    try {
        // Test our newly created unit with visible materials
        const unitId = 'tnD7GvGz6Mahq7lGGQKC'; // Our CS101 unit
        console.log(`\n📚 Testing unit: ${unitId} (CS101 - Introduction to Computer Science)`);
        
        // Get the raw semester plan (lecturer view)
        const rawResponse = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
            method: 'GET',
            headers
        });
        
        if (rawResponse.ok) {
            const rawData = await rawResponse.json();
            const plan = rawData.plan;
            
            console.log('\n🔍 Raw Plan (Lecturer View):');
            console.log(`- Semester weeks: ${plan.semesterWeeks}`);
            console.log(`- Week plans: ${plan.weekPlans?.length || 0}`);
            
            if (plan.weekPlans && plan.weekPlans.length > 0) {
                let totalMaterials = 0;
                let visibleMaterials = 0;
                let totalAssignments = 0;
                let totalExams = 0;
                
                plan.weekPlans.forEach((week, index) => {
                    const weekMaterials = week.materials?.length || 0;
                    const weekVisibleMaterials = week.materials?.filter(m => m.isVisible)?.length || 0;
                    const weekAssignments = week.assignments?.length || 0;
                    const weekExams = week.exams?.length || 0;
                    
                    totalMaterials += weekMaterials;
                    visibleMaterials += weekVisibleMaterials;
                    totalAssignments += weekAssignments;
                    totalExams += weekExams;
                    
                    console.log(`  Week ${week.weekNumber}:`);
                    console.log(`    - Materials: ${weekMaterials} (${weekVisibleMaterials} visible)`);
                    console.log(`    - Assignments: ${weekAssignments}`);
                    console.log(`    - Exams: ${weekExams}`);
                    
                    if (week.materials && week.materials.length > 0) {
                        week.materials.forEach((material, matIndex) => {
                            console.log(`      📄 Material ${matIndex + 1}: ${material.title} (visible: ${material.isVisible})`);
                        });
                    }
                });
                
                console.log(`\n📊 Totals:`);
                console.log(`- Total materials: ${totalMaterials}`);
                console.log(`- Visible to students: ${visibleMaterials}`);
                console.log(`- Total assignments: ${totalAssignments}`);
                console.log(`- Total exams: ${totalExams}`);
                
                console.log('\n🎓 Student View Filter Results:');
                if (visibleMaterials > 0) {
                    console.log('✅ Students should see semester plan content!');
                    console.log(`✅ ${visibleMaterials} materials will be visible to students`);
                } else {
                    console.log('❌ No visible materials - students will see empty semester plan');
                }
                
                // Simulate student filtering
                console.log('\n🔄 Simulating Student Filter...');
                let studentVisibleContent = false;
                
                plan.weekPlans.forEach((week, index) => {
                    const visibleMaterials = week.materials?.filter(m => m.isVisible) || [];
                    const visibleAssignments = week.assignments?.filter(a => new Date() >= new Date(a.assignDate)) || [];
                    const visibleExams = week.exams?.filter(e => e.approvalStatus === 'approved') || [];
                    
                    if (visibleMaterials.length > 0 || visibleAssignments.length > 0 || visibleExams.length > 0) {
                        studentVisibleContent = true;
                    }
                    
                    if (visibleMaterials.length > 0 || visibleAssignments.length > 0 || visibleExams.length > 0) {
                        console.log(`  Week ${week.weekNumber} visible content:`);
                        console.log(`    - Materials: ${visibleMaterials.length}`);
                        console.log(`    - Assignments: ${visibleAssignments.length}`);
                        console.log(`    - Exams: ${visibleExams.length}`);
                    }
                });
                
                if (studentVisibleContent) {
                    console.log('\n🎉 SUCCESS: Students will see semester plan content!');
                } else {
                    console.log('\n❌ ISSUE: No content will be visible to students after filtering');
                }
            }
        } else {
            console.log('❌ Failed to get semester plan');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testStudentView();
