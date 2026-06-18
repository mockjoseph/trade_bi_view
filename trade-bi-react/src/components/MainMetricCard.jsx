import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Droplets,
  Flame,
  Wind,
  Wrench,
} from "lucide-react";

export default function MainMetricCard({ label, value, sub, trend, accentClass }) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend === "up" ? "text-emerald-400" : "text-red-400";
  return (
    <div className={`bg-slate-800 rounded-xl p-4 border-l-4 ${accentClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">{label}</p>
      <p className="text-2xl font-semibold text-slate-50 leading-none mb-1">{value}</p>
      {sub && (
        <div className={`flex items-center gap-1 text-[11px] ${trendColor}`}>
          {trend && <TrendIcon size={11} />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}