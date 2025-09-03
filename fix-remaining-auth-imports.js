import { promises as fs } from 'fs';
import { join } from 'path';

const projectRoot = 'c:\\Users\\billy\\sep\\tvet-connect-kenya\\src';

async function findAndReplace(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = join(dir, file.name);
    
    if (file.isDirectory()) {
      await findAndReplace(filePath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check for any AuthContext references
        const hasOldImports = 
          content.includes("from '@/contexts/AuthContext'") ||
          content.includes('from "@/contexts/AuthContext"');
        
        if (hasOldImports) {
          console.log(`Updating: ${filePath}`);
          
          let updatedContent = content
            .replace(/from '@\/contexts\/AuthContext'/g, "from '@/contexts/SupabaseAuthContext'")
            .replace(/from "@\/contexts\/AuthContext"/g, 'from "@/contexts/SupabaseAuthContext"');
          
          await fs.writeFile(filePath, updatedContent, 'utf8');
          console.log(`✅ Updated: ${filePath}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not process ${filePath}: ${error.message}`);
      }
    }
  }
}

console.log('🔄 Final cleanup: Updating remaining AuthContext imports...');
findAndReplace(projectRoot)
  .then(() => {
    console.log('✅ All AuthContext imports updated!');
  })
  .catch(console.error);
