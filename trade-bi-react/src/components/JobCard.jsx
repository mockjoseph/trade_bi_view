
export default function JobCard({
  id,
  job_type,
  first_name,
  last_name,
  scheduled_date,
  completion_date,
  revenue,
  labor_cost,
  material_cost,
  billing_status,
  onSelect
}) {
  const needsData = revenue == null || labor_cost == null || material_cost == null

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const formatCurrency = (v) =>
    v == null ? null : v.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div 
        onClick={() => onSelect(id)}
        className="flex items-center gap-4 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 rounded-full pl-5 pr-6 py-3 transition-colors">
      {/* Status dot */}
      <span
        className={`shrink-0 w-2.5 h-2.5 rounded-full ${
          needsData ? 'bg-amber-400' : 'bg-emerald-400'
        }`}
      />

      {/* Job type + customer */}
      <div className="flex flex-col min-w-[140px]">
        <span className="text-slate-100 font-semibold leading-tight">{job_type}</span>
        <span className="text-slate-400 text-sm leading-tight">
          {first_name} {last_name}
        </span>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      {/* Dates */}
      <div className="flex flex-col text-sm text-slate-300 min-w-[120px]">
        <span>{formatDate(scheduled_date)}</span>
        <span className="text-slate-500">→ {formatDate(completion_date)}</span>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden md:block" />

      {/* Financials */}
      <div className="hidden md:flex flex-col text-sm min-w-[100px]">
        <span className="text-slate-300">{formatCurrency(revenue) ?? 'No revenue'}</span>
        <span className="text-slate-500">
          {labor_cost == null && material_cost == null
            ? 'No costs entered'
            : `${formatCurrency(labor_cost) ?? '—'} labor · ${formatCurrency(material_cost) ?? '—'} mat.`}
        </span>
      </div>

      {/* Spacer pushes badges right */}
      <div className="flex-1" />

      {/* Billing status */}
      {billing_status && (
        <span className="text-xs font-medium text-slate-300 bg-slate-700/60 rounded-full px-3 py-1 whitespace-nowrap">
          {billing_status}
        </span>
      )}

      {/* Needs-data badge */}
      {needsData && (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-950/50 border border-amber-800 rounded-full px-3 py-1 whitespace-nowrap">
          Needs data
        </span>
      )}
    </div>
  )
}