// jobDetailApi.js
// Outline of every RPC call this page needs. Each function returns hardcoded
// data for now so the UI can be wired up and previewed before the backend
// logic is switched on. Real implementation is commented out beneath each
// one, matching the SQL functions already written, so flipping these on
// later is a one-line uncomment + delete the hardcoded return.



// ---------------------------------------------------------------------------
// 1. Core job detail — job_type, customer, dates, description
// ---------------------------------------------------------------------------
export async function getJobDetail(jobId) {
  return {
    id: jobId,
    job_type: 'HVAC Repair',
    description: 'Replace failing capacitor on outdoor condenser unit, check refrigerant levels.',
    first_name: 'Maria',
    last_name: 'Gonzalez',
    email: 'maria.gonzalez@example.com',
    phone: '(509) 555-0192',
    scheduled_date: '2026-06-10',
    completion_date: '2026-06-12',
  }

  // const { data, error } = await supabase.rpc('get_job_detail', { job_id: jobId })
  // if (error) {
  //   console.log(error)
  //   throw error
  // }
  // return data?.[0] ?? null
}

// ---------------------------------------------------------------------------
// 2. Financials for this one job — revenue, costs, margin, billing status
// ---------------------------------------------------------------------------
export async function getJobFinancials(jobId) {
  return {
    revenue: 480,
    labor_cost: 150,
    material_cost: 95,
    billing_status: 'invoiced',
  }

  // const { data, error } = await supabase.rpc('get_job_financials', { job_id: jobId })
  // if (error) {
  //   console.log(error)
  //   throw error
  // }
  // return data?.[0] ?? null
}

// ---------------------------------------------------------------------------
// 3. Data health for THIS job specifically — which fields are still missing
//    (Reuses the same shape of logic as get_data_health_summary, but scoped
//    to one job rather than the whole org — needed so the detail page can
//    show exactly what's missing, not just that something is.)
// ---------------------------------------------------------------------------
export function getJobDataGaps(job) {
  const gaps = []
  if (job?.revenue == null) gaps.push('revenue')
  if (job?.labor_cost == null) gaps.push('labor cost')
  if (job?.material_cost == null) gaps.push('material cost')
  if (job?.billing_status == null) gaps.push('billing status')
  return gaps
}

// ---------------------------------------------------------------------------
// Derived metrics — computed client-side from the two fetches above,
// not separate RPCs. Hardcoded fallback values shown if inputs are missing.
// ---------------------------------------------------------------------------
export function calculateMargin(financials) {
  const { revenue, labor_cost, material_cost } = financials ?? {}
  if (revenue == null || labor_cost == null || material_cost == null || revenue === 0) {
    return null
  }
  const marginPct = ((revenue - labor_cost - material_cost) / revenue) * 100
  return Math.round(marginPct * 10) / 10
}

export function calculateCompletionSpeed(job) {
  const { scheduled_date, completion_date } = job ?? {}
  if (!scheduled_date || !completion_date) return null
  const days = Math.round(
    (new Date(completion_date) - new Date(scheduled_date)) / (1000 * 60 * 60 * 24)
  )
  return days
}