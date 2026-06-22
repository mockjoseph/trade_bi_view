// Add/merge this into your existing tailwind.config.js theme.extend block.
// These are semantic tokens so "amber = needs attention" lives in ONE place,
// instead of being re-typed as raw slate/amber/emerald classes on every component.

module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1e293b',   // slate-800 — card backgrounds
          raised: '#0f172a',    // slate-900 — inputs, recessed areas
          hover: '#27364a',     // slightly lighter than DEFAULT, for hover states
        },
        outline: {
          DEFAULT: '#334155',   // slate-700 — default borders/dividers
          hover: '#475569',     // slate-600 — hover borders
        },
        status: {
          good: '#34d399',      // emerald-400 — paid, complete, healthy margin
          'good-bg': 'rgba(16, 185, 129, 0.1)',
          warn: '#fbbf24',      // amber-400 — needs data, invoiced/pending
          'warn-bg': 'rgba(245, 158, 11, 0.1)',
          bad: '#f87171',       // red-400 — overdue, errors, missing data
          'bad-bg': 'rgba(239, 68, 68, 0.1)',
        },
      },
    },
  },
}

// Usage going forward, instead of:
//   className="bg-slate-800/70 border border-slate-700"
// write:
//   className="bg-surface border border-outline"
//
// And instead of inline amber/emerald conditionals scattered per-component:
//   className={needsData ? 'text-amber-400 bg-amber-950/50' : 'text-emerald-400 bg-emerald-950/40'}
// write:
//   className={needsData ? 'text-status-warn bg-status-warn-bg' : 'text-status-good bg-status-good-bg'}
//
// This means if you ever want to retheme (e.g. tune the exact blue), you edit
// the config in one place rather than hunting through every component.