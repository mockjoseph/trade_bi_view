import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import {
  Droplets,
  Flame,
  Wind,
  Wrench,
} from "lucide-react";
import { HARDCODED_ORG_ID } from '../constants';

const JOB_TYPE_STYLES = {
  "AC Installation":    { color: "bg-blue-500",    icon: Wind,     iconBg: "bg-blue-950",    iconColor: "text-blue-400" },
  "Furnace Tune Up":    { color: "bg-emerald-500", icon: Flame, iconBg: "bg-emerald-950", iconColor: "text-emerald-400" },
  "Emergency Repair":   { color: "bg-amber-400",   icon: Wrench,    iconBg: "bg-amber-950",   iconColor: "text-amber-400" },
  "Other":              { color: "bg-purple-400",  icon: Wrench,   iconBg: "bg-purple-950",  iconColor: "text-purple-400" },
};

const DEFAULT_STYLE = { color: "bg-gray-400", icon: Wrench, iconBg: "bg-gray-950", iconColor: "text-gray-400" };

async function fetchrevenueByType() {
  const { data, error } = await supabase.rpc('get_revenue_by_type', {org_id: HARDCODED_ORG_ID});
  if (error) {
    console.log(error);
    throw error;
  }
  //console.log("RAW DATA:", JSON.stringify(data, null, 2)); // <-- add this
  const max_revenue = Math.max(...data.map(row => row.total_revenue), 0);

  const jobTypes = data.map(row => {
    const style = JOB_TYPE_STYLES[row.job_type] ?? DEFAULT_STYLE;
    return {
      name: row.job_type,
      count: row.count,
      total_revenue: row.total_revenue,
      pct: max_revenue > 0 ? Math.round((row.total_revenue / max_revenue) * 100) : 0,
      ...style,
    };
  });
  //console.log("SHAPED DATA:", JSON.stringify(jobTypes, null, 2)); // <-- add this
  return jobTypes;
}

export default function RevenueBreakdown(){
    const { data: jobTypes, isLoading, isError, error } = useQuery({
        queryKey: ['get_total_revenue_by_type'], // A unique identifier string used to manage the cache for this query
        queryFn: fetchrevenueByType,   // The actual asynchronous promise-returning function
        });

    
    if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl overflow-hidden w-72 shrink-0 px-4 py-6 text-center">
        <p className="text-xs text-slate-500">Loading Total Revenue data...</p>
      </div>
    );
    }

  if (isError) {
    return (
      <div className="bg-slate-800 rounded-xl overflow-hidden w-72 shrink-0 px-4 py-6 text-center">
        <p className="text-xs text-red-400">Failed to load: {error.message}</p>
      </div>
    );
    }

    return (
    <div className="bg-slate-800 rounded-xl overflow-hidden w-72 shrink-0">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-200">Revenue by Type</h2>
      </div>

      <div className="divide-y divide-slate-900">
        {jobTypes.map(({ name, count, total_revenue, pct, color, icon: Icon, iconBg, iconColor }) => (
          <div key={name} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${iconBg}`}>
                <Icon size={13} className={iconColor} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-300">{name}</p>
                <p className="text-[10px] text-slate-500">{count} jobs</p>
                {/* Mini bar */}
                <div className="w-20 h-0.5 bg-slate-700 rounded-full mt-1">
                  <div className={`h-0.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold text-emerald-400">
              ${total_revenue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}