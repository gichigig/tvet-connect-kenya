import { InstitutionBranchService } from '../src/integrations/supabase/institutionBranch.js';

const service = new InstitutionBranchService();

console.log('🧪 Testing Institution Branch Service...');

async function testInstitutionBranch() {
  try {
    // Test creating a branch
    console.log('1. Creating test institution branch...');
    const testBranch = {
      name: 'Test Branch Campus',
      code: 'TBC',
      address: '123 Main Street',
      city: 'Nairobi',
      region: 'Central',
      phone: '+254123456789',
      email: 'test@branch.edu',
      created_by: 'test-user-id'
    };
    
    const { data: createdBranch, error: createError } = await service.createBranch(testBranch);
    
    if (createError) {
      console.error('❌ Error creating branch:', createError.message);
      return;
    }
    
    if (!createdBranch) {
      console.error('❌ No data returned from branch creation');
      return;
    }
    
    console.log('✅ Branch created successfully:', createdBranch);
    
    // Test listing branches
    console.log('2. Listing all branches...');
    const { data: branches, error: listError } = await service.listBranches();
    
    if (listError) {
      console.error('❌ Error listing branches:', listError.message);
      return;
    }
    
    console.log('✅ Branches listed successfully:', branches);
    
    // Test updating the branch
    console.log('3. Updating branch...');
    const updates = { phone: '+254987654321' };
    const { data: updatedBranch, error: updateError } = await service.updateBranch(createdBranch.id, updates);
    
    if (updateError) {
      console.error('❌ Error updating branch:', updateError.message);
      return;
    }
    
    console.log('✅ Branch updated successfully:', updatedBranch);
    
    // Test deleting the branch
    console.log('4. Deleting test branch...');
    const { error: deleteError } = await service.deleteBranch(createdBranch.id);
    
    if (deleteError) {
      console.error('❌ Error deleting branch:', deleteError.message);
      return;
    }
    
    console.log('✅ Branch deleted successfully');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

testInstitutionBranch();
