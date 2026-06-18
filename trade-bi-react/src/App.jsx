import { useState } from "react";
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
import SupabaseQuery from "./SupabaseQuery";
import RecentJobs from "./components/RecentJobs"
import MainDashboard from "./components/MainDashboard";
import Metrics from "./components/Metrics";
import RevenueBreakdown from "./components/RevenueBreakdown";
import AddJob from "./components/AddJob";
// ─── Mock Data ────────────────────────────────────────────────────────────────
const RECENT_JOBS = [
  { id: 1, name: "AC Install",       customer: "R. Torres",  date: "Jun 10", revenue: 2400, margin: 48, status: "paid" },
  { id: 2, name: "Pipe Repair",      customer: "J. Nguyen",  date: "Jun 9",  revenue: 680,  margin: 61, status: "paid" },
  { id: 3, name: "Furnace Tune-up",  customer: "S. Patel",   date: "Jun 8",  revenue: 320,  margin: 55, status: "invoiced" },
  { id: 4, name: "Water Heater",     customer: "K. Wilson",  date: "Jun 6",  revenue: 1850, margin: 39, status: "invoiced" },
  { id: 5, name: "Duct Cleaning",    customer: "M. Clark",   date: "Jun 5",  revenue: 450,  margin: 72, status: "paid" },
];

const JOB_TYPES = [
  { label: "HVAC Install", count: 8,  revenue: 9200,  pct: 75, color: "bg-blue-500",   icon: Wind,    iconBg: "bg-blue-950",   iconColor: "text-blue-400" },
  { label: "Plumbing",     count: 10, revenue: 5800,  pct: 50, color: "bg-emerald-500",icon: Droplets, iconBg: "bg-emerald-950", iconColor: "text-emerald-400" },
  { label: "Heating",      count: 4,  revenue: 2450,  pct: 28, color: "bg-amber-400",  icon: Flame,   iconBg: "bg-amber-950",  iconColor: "text-amber-400" },
  { label: "Other",        count: 2,  revenue: 1000,  pct: 12, color: "bg-purple-400", icon: Wrench,  iconBg: "bg-purple-950", iconColor: "text-purple-400" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const styles = {
    paid:     "bg-emerald-950 text-emerald-300 border border-emerald-800",
    invoiced: "bg-amber-950  text-amber-300  border border-amber-800",
    pending:  "bg-blue-950   text-blue-300   border border-blue-800",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

function MetricCard({ label, value, sub, trend, accentClass }) {
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

function Sidebar({ active, setActive }) {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "jobs",      icon: Briefcase,       label: "Jobs" },
    { id: "customers", icon: Users,            label: "Customers" },
    { id: "invoices",  icon: FileText,         label: "Invoices" },
  ];

  return (
    <aside className="w-14 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 gap-2 shrink-0">
      {/* Logo */}
      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
        <Zap size={16} className="text-slate-900" />
      </div>

      {/* Nav items */}
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          title={label}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            active === id
              ? "bg-slate-800 text-amber-400"
              : "text-slate-600 hover:text-slate-400"
          }`}
        >
          <Icon size={18} />
        </button>
      ))}

      {/* Settings at bottom */}
      <button
        title="Settings"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 mt-auto"
      >
        <Settings size={18} />
      </button>
    </aside>
  );
}

function RecentJobsTable() {
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
            {["Job", "Customer", "Date", "Revenue", "Margin", "Status"].map((h) => (
              <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RECENT_JOBS.map((job) => (
            <tr key={job.id} className="border-b border-slate-900 hover:bg-slate-750 transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium text-slate-200">{job.name}</td>
              <td className="px-4 py-2.5 text-xs text-slate-400">{job.customer}</td>
              <td className="px-4 py-2.5 text-xs text-slate-400">{job.date}</td>
              <td className="px-4 py-2.5 text-xs font-semibold text-emerald-400">
                ${job.revenue.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-xs text-slate-400">{job.margin}%</td>
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

function RevenueByType() {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden w-72 shrink-0">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-200">Revenue by Type</h2>
      </div>
      <div className="divide-y divide-slate-900">
        {JOB_TYPES.map(({ label, count, revenue, pct, color, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${iconBg}`}>
                <Icon size={13} className={iconColor} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-300">{label}</p>
                <p className="text-[10px] text-slate-500">{count} jobs</p>
                {/* Mini bar */}
                <div className="w-20 h-0.5 bg-slate-700 rounded-full mt-1">
                  <div className={`h-0.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold text-emerald-400">
              ${revenue.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-100">
            Good morning, Mike{" "}
            <span className="text-slate-500 font-normal text-xs ml-1">{today}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-red-950 text-red-300 border border-red-800 rounded-full px-2.5 py-1 text-[11px] font-medium">
            <AlertCircle size={11} />
            3 unpaid invoices
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-[11px] font-bold text-slate-900">
            MH
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {/* Metric cards */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">
            This month — June 2026
          </p>
          <div className="grid grid-cols-4 gap-3">
            <MetricCard
              label="Total Revenue"
              value="$18,450"
              sub="↑ 12% vs last month"
              trend="up"
              accentClass="border-emerald-500"
            />
            <MetricCard
              label="Avg Job Margin"
              value="43%"
              sub="↓ 2% vs last month"
              trend="down"
              accentClass="border-amber-400"
            />
            <MetricCard
              label="Jobs Completed"
              value="24"
              sub="↑ 4 vs last month"
              trend="up"
              accentClass="border-blue-400"
            />
            <MetricCard
              label="Outstanding"
              value="$3,200"
              sub="3 unpaid invoices"
              accentClass="border-red-400"
            />
          </div>
        </section>

        {/* Jobs table + breakdown */}
        <section className="flex gap-4 flex-1">
          <RecentJobs />
          <RevenueBreakdown />
        </section>

  
          <Metrics />
          <AddJob />
      </main>
    </div>
  );
}

// ─── Placeholder for future pages ────────────────────────────────────────────

function PlaceholderPage({ title }) {
  return (
    <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
      {title} — coming soon
      <AddJob />
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const pages = {
    dashboard: <DashboardPage />,
    jobs:      <PlaceholderPage title="Jobs" />,
    customers: <PlaceholderPage title="Customers" />,
    invoices:  <PlaceholderPage title="Invoices" />,
  };


  return (
    <div className="flex h-screen bg-slate-900 text-slate-50 overflow-hidden">
      <Sidebar active={activePage} setActive={setActivePage} />
      {pages[activePage]}
      
      {/* <RecentJobs /> */}
    </div>
    
  );
}
