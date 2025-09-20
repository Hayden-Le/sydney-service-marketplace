
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Attempting to connect to Supabase and run a simple query...');
  
  try {
    const { data, error } = await supabase.from('User').select('id').limit(1);

    if (error && (error.message.includes('relation "User" does not exist') || error.message.includes('Could not find the table'))) {
        console.log('\n✅ SUCCESS: Connected to the database successfully!');
        console.log('The "User" table does not exist yet, which is expected because the migration has not run.');
        console.log('This confirms your connection is working correctly.');
        process.exit(0);
    }

    if (error) {
      console.error('\n❌ FAILURE: An error occurred while querying the database:');
      console.error(error);
      process.exit(1);
    }

    console.log('\n✅ SUCCESS: Connected to the database and ran a query.');
    console.log('This is unexpected, as the migration should not have run yet. Data:', data);
    process.exit(0);

  } catch (err) {
    console.error('\n❌ FAILURE: A critical error occurred:');
    console.error(err);
    process.exit(1);
  }
}

checkConnection();
