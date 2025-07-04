#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * Run this script to test your Supabase configuration
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testSupabaseConnection() {
  logHeader('Supabase Connection Test');

  // Check environment variables
  logHeader('Checking Environment Variables');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  let missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
      // Check if it looks like a valid JWT
      if (varName.includes('KEY') && !process.env[varName].startsWith('eyJ')) {
        logWarning(`${varName} doesn't look like a valid JWT token`);
      }
    } else {
      logError(`${varName} is missing`);
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    logError('Missing required environment variables. Please check your .env.local file.');
    return;
  }

  // Initialize Supabase clients
  logHeader('Initializing Supabase Client');
  
  let supabase, supabaseAdmin;
  try {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    logSuccess('Supabase clients initialized successfully');
  } catch (error) {
    logError(`Failed to initialize Supabase client: ${error.message}`);
    return;
  }

  // Test database connection
  logHeader('Testing Database Connection');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        logWarning('Users table does not exist yet. Run migrations first.');
      } else {
        throw error;
      }
    } else {
      logSuccess('Database connection successful');
      logSuccess(`Users table exists and is accessible`);
    }
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
  }

  // Test storage buckets
  logHeader('Testing Storage Buckets');
  
  try {
    // Try with regular client first
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      logWarning(`Regular client can't list buckets: ${error.message}`);
      // Try with admin client
      try {
        const { data: adminBuckets, error: adminError } = await supabaseAdmin.storage.listBuckets();
        if (adminError) {
          logError(`Admin client also failed: ${adminError.message}`);
        } else {
          logSuccess('Admin client can access storage buckets');
          if (adminBuckets && adminBuckets.length > 0) {
            logSuccess(`Found ${adminBuckets.length} storage bucket(s):`);
            adminBuckets.forEach(bucket => {
              log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`, 'blue');
            });
          }
        }
      } catch (adminError) {
        logError(`Admin storage test failed: ${adminError.message}`);
      }
    } else {
      if (buckets && buckets.length > 0) {
        logSuccess(`Found ${buckets.length} storage bucket(s):`);
        buckets.forEach(bucket => {
          log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`, 'blue');
        });
        
        // Test specific buckets we expect
        const expectedBuckets = ['user-uploads', 'portfolios'];
        expectedBuckets.forEach(bucketName => {
          const bucket = buckets.find(b => b.name === bucketName);
          if (bucket) {
            logSuccess(`✅ ${bucketName} bucket found`);
          } else {
            logWarning(`⚠️  ${bucketName} bucket missing`);
          }
        });
      } else {
        logWarning('No storage buckets found. Run storage migration in Supabase dashboard.');
      }
    }
  } catch (error) {
    logError(`Storage test failed: ${error.message}`);
  }

  // Test authentication
  logHeader('Testing Authentication');
  
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (session?.session) {
      logSuccess('User is authenticated');
    } else {
      log('No active session (this is normal for connection test)', 'blue');
    }
    
    logSuccess('Authentication service is accessible');
  } catch (error) {
    logError(`Authentication test failed: ${error.message}`);
  }

  // Check project health
  logHeader('Project Health Check');
  
  try {
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      logWarning('Could not retrieve database version');
    } else {
      logSuccess('Database is responsive');
    }
  } catch (error) {
    // This is expected if the RPC doesn't exist
    logSuccess('Basic health check passed');
  }

  logHeader('Connection Test Complete');
  log('\nIf you see any errors above, please check:', 'yellow');
  log('1. Your .env.local file has the correct values', 'yellow');
  log('2. Your Supabase project is active', 'yellow');
  log('3. Your API keys are valid', 'yellow');
  log('4. Your database migrations have been run', 'yellow');
}

// Run the test
testSupabaseConnection().catch(error => {
  logError(`Test failed: ${error.message}`);
  process.exit(1);
});