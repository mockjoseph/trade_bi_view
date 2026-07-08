
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { HARDCODED_ORG_ID } from '../constants';
import JobCard from './JobCard'

async function getAllJobs() {
  const { data, error } = await supabase.rpc('get_all_jobs', { org_id: HARDCODED_ORG_ID })

  if (error) {
    console.log(error)
    throw error
  }
  return data
}

export default function JobsPage({ onSelectJob, title = 'Jobs' }) {
  const { data: jobs = [], isLoading: jobsLoading, isError: jobsError, error: jobsErrorDetail } = useQuery({
    queryKey: ['getJobs'],
    queryFn: getAllJobs,
  })

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400">Loading jobs...</p>
      </div>
    )
  }

  if (jobsError) {
    return (
      <div className="max-w-md mx-auto mt-10 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-4 py-3">
        Failed to load jobs{jobsErrorDetail?.message ? `: ${jobsErrorDetail.message}` : '.'}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400">No jobs yet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      <h1 className="text-xl font-semibold text-slate-100 mb-4">{title}</h1>

      {jobs.map((job) => (
        <JobCard
          id={job.id}
          key={job.id}
          job_type={job.job_type}
          first_name={job.first_name}
          last_name={job.last_name}
          scheduled_date={job.scheduled_date}
          completion_date={job.completion_date}
          revenue={job.revenue}
          labor_cost={job.labor_cost}
          material_cost={job.material_cost}
          billing_status={job.billing_status}
          onSelect={onSelectJob}
          {...job}
        />
      ))}
    </div>
  )
}