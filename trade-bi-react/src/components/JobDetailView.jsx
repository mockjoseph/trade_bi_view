import { getJobDataGaps, calculateMargin, calculateCompletionSpeed } from './jobDetailApi'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(v) {
  if (v == null) return '—'
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function billingStatusStyle(status) {
  switch (status) {
    case 'paid':
      return 'text-status-good bg-status-good-bg border-emerald-800'
    case 'invoiced':
      return 'text-status-warn bg-status-warn-bg border-amber-800'
    default:
      return 'text-slate-400 bg-slate-700/40 border-slate-600'
  }
}

export default function JobDetailView({ job }) {
  const gaps = getJobDataGaps(job) // now checks job.revenue etc directly, no separate financials object
  const margin = calculateMargin(job)
  const completionSpeed = calculateCompletionSpeed(job)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">{job.job_type}</h1>
      </div>

      {gaps.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-status-warn bg-status-warn-bg border border-amber-800 rounded-lg px-4 py-3">
          <span className="w-1.5 h-1.5 rounded-full bg-status-warn mt-1.5 shrink-0" />
          <span>Missing: {gaps.join(', ')}.</span>
        </div>
      )}

      <div className="bg-surface border border-outline rounded-xl p-6 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Customer</p>
          <p className="text-slate-200 font-medium">{job.first_name} {job.last_name}</p>
        </div>

        <div className="h-px bg-outline" />

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Schedule</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Scheduled</p>
              <p className="text-slate-200">{formatDate(job.scheduled_date)}</p>
            </div>
            <div>
              <p className="text-slate-500">Completed</p>
              <p className="text-slate-200">{job.completion_date ? formatDate(job.completion_date) : 'In progress'}</p>
            </div>
          </div>
          {completionSpeed != null && (
            <p className="text-xs text-slate-500 mt-2">
              Took {completionSpeed} {completionSpeed === 1 ? 'day' : 'days'} from schedule to completion
            </p>
          )}
        </div>

        <div className="h-px bg-outline" />

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Financials</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Revenue</p>
              <p className="text-slate-200 font-medium">{formatCurrency(job.revenue)}</p>
            </div>
            <div>
              <p className="text-slate-500">Costs</p>
              <p className="text-slate-200 font-medium">
                {formatCurrency(
                  job.labor_cost != null && job.material_cost != null
                    ? job.labor_cost + job.material_cost
                    : null
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Margin</p>
              <p className={`font-medium ${margin != null && margin < 20 ? 'text-status-warn' : 'text-status-good'}`}>
                {margin != null ? `${margin}%` : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-outline" />

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Billing</p>
          <span className={`inline-block text-sm font-medium rounded-full border px-3 py-1 capitalize ${billingStatusStyle(job.billing_status)}`}>
            {job.billing_status ?? 'Not set'}
          </span>
        </div>
      </div>
    </div>
  )
}
