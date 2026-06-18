// test-insert-job.js
//
// Quick command-line script to test inserting a row into the `job` table
// without going through the React form. This logs the FULL Postgres error
// (message, details, hint, code) so you can see exactly what's wrong —
// wrong data type, FK violation, not-null violation, etc.
//
// SETUP:
//   1. npm install @supabase/supabase-js dotenv
//   2. Create a .env file in this folder with:
//        SUPABASE_URL=https://your-project.supabase.co
//        SUPABASE_KEY=your-anon-or-service-role-key
//   3. Run: node test-insert-job.js

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper to print Supabase/Postgres errors in full, not just error.message
function logFullError(label, error) {
  console.log(`\n--- ${label} ---`)
  console.log('message:', error.message)
  console.log('details:', error.details)
  console.log('hint:', error.hint)
  console.log('code:', error.code)
  console.log('--------------------\n')
}

async function getRealJobTypeId() {
  // Adjust 'job_types' and 'id' below if your table/column names differ
  const { data, error } = await supabase
    .from('job_types')
    .select('id')
    .limit(1)
    .single()

  if (error) {
    logFullError('Failed to fetch a job_types id', error)
    return null
  }
  return data.id
}

async function getRealCustomerId() {
  // Adjust 'customer' and 'id' below if your table/column names differ
  const { data, error } = await supabase
    .from('customers')
    .select('id')
    .limit(1)
    .single()

  if (error) {
    logFullError('Failed to fetch a customer id', error)
    return null
  }
  return data.id
}

async function runTest() {
  console.log('Fetching a real job_types_id and customer_id to satisfy FK constraints...')

  const jobTypeId = await getRealJobTypeId()
  const customerId = await getRealCustomerId()

  if (!jobTypeId || !customerId) {
    console.log(
      'Could not find existing job_types or customer rows. ' +
      'Make sure at least one row exists in each table, or hardcode ' +
      'known-good IDs below instead of calling getRealJobTypeId()/getRealCustomerId().'
    )
    return
  }

  console.log(`Using job_types_id: ${jobTypeId}`)
  console.log(`Using customer_id: ${customerId}`)

  // This is the actual test insert. Tweak values here to test different
  // scenarios (e.g. set scheduled_date: '' to reproduce a date-type error,
  // or status: 123 to test a wrong-type error, etc.)
  const testJob = {
    job_types_id: jobTypeId,
    customer_id: customerId,
    description: 'Test job inserted via script',
    status: 'scheduled',
    scheduled_date: '2026-06-20',   // must be YYYY-MM-DD or null, not ''
    completion_date: null            // ok to leave null if not completed yet
  }

  console.log('\nAttempting insert with:', testJob)

  const { data, error } = await supabase
    .from('job')
    .insert([testJob])
    .select()

  if (error) {
    logFullError('Insert failed', error)
    return
  }

  console.log('Insert succeeded! Inserted row(s):')
  console.log(data)
}

runTest()