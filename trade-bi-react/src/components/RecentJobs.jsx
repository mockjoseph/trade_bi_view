import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { ChevronRight } from 'lucide-react'
import StatusPill from './StatusPill'
import { HARDCODED_ORG_ID } from '../constants'
// 1. Define a clean, standalone fetching function
async function fetchSupabaseData() {
  const { data, error } = await supabase.rpc('get_recent_jobs', {org_id: HARDCODED_ORG_ID})
  
  if (error) throw new Error(error.message)
  return data
}


export default function RecentJobs() {
    // 2. Pass the function into useQuery
    const { data: recentJobs, isLoading, isError, error } = useQuery({
    queryKey: ['myDatabaseData'], // A unique identifier string used to manage the cache for this query
    queryFn: fetchSupabaseData,   // The actual asynchronous promise-returning function
    })

    if (isLoading) return <div>Loading data from cache/database...</div>
    if (isError) return <div>Error loading data: {error.message}</div>

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden flex-1">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Recent Jobs</h2>
        <button className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 transition-colors">
          View all <ChevronRight size={12} />
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {["Job", "Customer", "Completion Date", "Revenue", "Margin", "Status"].map((h) => (
              <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recentJobs.map((job) => (
            <tr key={job.id} className="border-b border-slate-900 hover:bg-slate-750 transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium text-slate-200">{job.job_type}</td>
              <td className="px-4 py-2.5 text-xs text-slate-400">{job.customer_first_name}</td>
              <td className="px-4 py-2.5 text-xs text-slate-400">{job.completion_date ?? 'Not yet completed'}</td>
              <td className="px-4 py-2.5 text-xs text-slate-400">${job.revenue}</td>
              <td className="px-4 py-2.5 text-xs text-slate-400">N/A</td>
              <td className="px-4 py-2.5">
                <StatusPill status={job.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}