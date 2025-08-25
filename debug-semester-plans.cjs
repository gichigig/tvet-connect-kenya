const firebase = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./tvet-connect-kenya-firebase-adminsdk-lr5me-68b8c3e05f.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://newy-35816-default-rtdb.firebaseio.com/"
});

const db = firebase.firestore();

async function debugSemesterPlans() {
  try {
    console.log('🔍 Debugging Semester Plans...\n');
    
    // Get all units
    const unitsSnapshot = await db.collection('units').get();
    console.log(`📚 Found ${unitsSnapshot.size} units in database\n`);
    
    for (const unitDoc of unitsSnapshot.docs) {
      const unitData = unitDoc.data();
      console.log(`📖 Unit: ${unitData.code} - ${unitData.name}`);
      console.log(`   ID: ${unitDoc.id}`);
      
      // Check for semester plans for this unit
      const semesterPlanRef = db.collection('semesterPlans').doc(unitDoc.id);
      const semesterPlanDoc = await semesterPlanRef.get();
      
      if (semesterPlanDoc.exists) {
        const planData = semesterPlanDoc.data();
        console.log(`   ✅ Has semester plan:`);
        console.log(`      - Semester start: ${planData.semesterStart ? new Date(planData.semesterStart.toDate()).toDateString() : 'Not set'}`);
        console.log(`      - Number of weeks: ${planData.semesterWeeks || 0}`);
        console.log(`      - Week plans: ${planData.weekPlans ? planData.weekPlans.length : 0}`);
        
        if (planData.weekPlans && planData.weekPlans.length > 0) {
          console.log(`      - Content breakdown:`);
          let totalMaterials = 0, totalAssignments = 0, totalExams = 0;
          planData.weekPlans.forEach(week => {
            totalMaterials += (week.materials || []).length;
            totalAssignments += (week.assignments || []).length;
            totalExams += (week.exams || []).length;
          });
          console.log(`        * Materials: ${totalMaterials}`);
          console.log(`        * Assignments: ${totalAssignments}`);
          console.log(`        * Exams: ${totalExams}`);
        }
      } else {
        console.log(`   ❌ No semester plan found`);
      }
      
      console.log(''); // Empty line for spacing
    }
    
    // Check for units with "cyber" or "crime" in the name
    console.log('\n🔍 Searching for units containing "cyber" or "crime"...\n');
    
    const cyberUnits = unitsSnapshot.docs.filter(doc => {
      const data = doc.data();
      const searchText = `${data.code} ${data.name}`.toLowerCase();
      return searchText.includes('cyber') || searchText.includes('crime');
    });
    
    if (cyberUnits.length > 0) {
      console.log(`Found ${cyberUnits.length} units matching "cyber" or "crime":`);
      for (const unit of cyberUnits) {
        const unitData = unit.data();
        console.log(`- ${unitData.code}: ${unitData.name} (ID: ${unit.id})`);
        
        // Check detailed semester plan for this unit
        const semesterPlanRef = db.collection('semesterPlans').doc(unit.id);
        const semesterPlanDoc = await semesterPlanRef.get();
        
        if (semesterPlanDoc.exists) {
          const planData = semesterPlanDoc.data();
          console.log(`  ✅ Semester plan details:`);
          console.log(`     Created by: ${planData.createdBy || 'Unknown'}`);
          console.log(`     Last updated: ${planData.updatedAt ? new Date(planData.updatedAt.toDate()).toISOString() : 'Unknown'}`);
          
          if (planData.weekPlans) {
            console.log(`     Week plans (${planData.weekPlans.length}):`);
            planData.weekPlans.forEach((week, index) => {
              console.log(`       Week ${week.weekNumber}: ${week.weekMessage || 'No message'}`);
              if (week.materials) {
                week.materials.forEach(material => {
                  console.log(`         📄 Material: ${material.title} (Visible: ${material.isVisible})`);
                });
              }
            });
          }
        } else {
          console.log(`  ❌ No semester plan found for this unit`);
        }
      }
    } else {
      console.log('No units found containing "cyber" or "crime"');
    }
    
  } catch (error) {
    console.error('Error debugging semester plans:', error);
  } finally {
    process.exit(0);
  }
}

debugSemesterPlans();
