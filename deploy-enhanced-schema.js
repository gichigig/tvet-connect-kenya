import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ympnvccreuhxouyovszg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcG52Y2NyZXVoeG91eW92c3pnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5NTM4MSwiZXhwIjoyMDY4ODcxMzgxfQ.sN-m4tOSUXxfwrVeqAwcxO10OuAEEpeEmKVGGgOYOfY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployEnhancedSchema() {
  console.log('🚀 Deploying Enhanced Database Schema...');

  try {
    // Read the enhanced schema file
    const schemaSQL = fs.readFileSync('./database_schema_enhanced.sql', 'utf8');
    
    // Split into individual statements (simple split by semicolon)
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        console.log(`⏳ Executing: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`⚠️  Warning: ${error.message}`);
          } else {
            console.error(`❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
          console.log('✅ Success');
        }
      } catch (err) {
        console.error(`❌ Unexpected error: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Deployment Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    // Test the tables were created
    console.log('\n🔍 Testing table creation...');
    
    const tables = ['institutions', 'departments', 'students'];
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Ready (${count || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    console.log('\n✨ Enhanced schema deployment completed!');
    
  } catch (error) {
    console.error('❌ Fatal error during deployment:', error.message);
  }
}

// Execute the deployment
deployEnhancedSchema();
