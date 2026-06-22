import JobDetailView from './JobDetailView'
import { useQueryClient } from '@tanstack/react-query'

export default function JobDetailPage({ jobId, onBack }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4"
      >
        ← Back to jobs
      </button>

      <JobDetailViewContainer jobId={jobId} onBack={onBack} />
    </div>
  )
}

function JobDetailViewContainer({ jobId, onBack }) {
  const queryClient = useQueryClient()

  // Pull the already-fetched list out of cache rather than re-fetching.
  const jobs = queryClient.getQueryData(['getJobs']) ?? []
  const job = jobs.find((j) => String(j.id) === String(jobId))

  if (!job) {
    return <NotFoundState onBack={onBack} />
  }

  return <JobDetailView job={job} />
}

function NotFoundState({ onBack }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-slate-400">
        Couldn't find that job here — try going back to the list.
      </p>
      <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300">
        ← Back to jobs
      </button>
    </div>
  )
}