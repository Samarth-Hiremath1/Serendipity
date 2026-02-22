import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const REQUIRED_TABLES = [
  'user_profiles',
  'events',
  'attendees',
  'event_relevance',
  'intel_cards',
  'contacts',
  'ai_cache'
];

async function verifyDatabase() {
  console.log('🔍 Verifying database schema...\n');
  
  let allTablesExist = true;
  
  for (const tableName of REQUIRED_TABLES) {
    try {
      // Try to query the table (limit 0 to avoid fetching data)
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (error) {
        console.log(`❌ Table "${tableName}" - NOT FOUND or ERROR`);
        console.log(`   Error: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table "${tableName}" - EXISTS`);
      }
    } catch (error) {
      console.log(`❌ Table "${tableName}" - ERROR`);
      console.log(`   Error: ${error}`);
      allTablesExist = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allTablesExist) {
    console.log('✅ Database verification PASSED');
    console.log('All required tables exist and are accessible.');
    console.log('\nYou can now start the development server:');
    console.log('  npm run dev');
  } else {
    console.log('❌ Database verification FAILED');
    console.log('Some tables are missing or inaccessible.');
    console.log('\nPlease run the migration:');
    console.log('  1. Open Supabase dashboard SQL Editor');
    console.log('  2. Copy contents of supabase/migrations/001_initial_schema.sql');
    console.log('  3. Paste and run in SQL Editor');
    console.log('\nSee supabase/SETUP.md for detailed instructions.');
    process.exit(1);
  }
}

verifyDatabase();
