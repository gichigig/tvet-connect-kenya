/**
 * Deploy Supabase Schema Script
 * Deploys the database schema directly to Supabase PostgreSQL
 */

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Extract database details from Supabase URL
function parseSupabaseUrl(url) {
  // Extract project ref from URL (e.g., ympnvccreuhxouyovszg from https://ympnvccreuhxouyovszg.supabase.co)
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error('Invalid Supabase URL format');
  }
  
  const projectRef = match[1];
  
  // Use direct pooler connection for better reliability
  return {
    host: `aws-0-eu-central-1.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

async function deploySchema() {
  console.log('🚀 Starting database schema deployment...');

  // Read the schema file
  const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Parse Supabase connection details
  const dbConfig = parseSupabaseUrl(process.env.SUPABASE_URL);
  
  console.log('📡 Connecting to Supabase database...');
  
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Executing ${statements.length} schema statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        await client.query(statement);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
      } catch (error) {
        // Some statements might fail if they already exist - this is often okay
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1}/${statements.length} skipped (already exists)`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.log('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('✅ Schema deployment completed!');
    
    // Verify some key tables were created
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:');
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the deployment
deploySchema().catch(console.error);
