import {
  Activity,
  LayoutDashboard,
  Plug,
  Radar,
  ScrollText,
  Settings,
  Webhook
} from 'lucide-react'

const navItems = [
  ['Dashboard', LayoutDashboard, true],
  ['Active Endpoints', Webhook],
  ['Data Stream', Activity],
  ['Integrations', Plug],
  ['Logs', ScrollText],
  ['Settings', Settings]
]

export default function Sidebar() {
  return (
    <aside className="flex w-16 flex-col items-center gap-2 border-r border-slate-800 bg-slate-900/60 py-5 backdrop-blur-xl lg:w-60 lg:items-stretch lg:px-3">
      <div className="flex items-center gap-2.5 px-1 pb-4 lg:px-2">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-400/30">
          <Radar className="size-5 text-emerald-400" />
        </div>
        <span className="hidden text-base font-semibold tracking-tight lg:block">
          Hook<span className="text-emerald-400">Catch</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(([label, Icon, active]) => (
          <button
            key={label}
            className={`group relative flex items-center justify-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors lg:justify-start ${
              active
                ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            }`}
          >
            <Icon className="size-5 shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto hidden rounded-xl border border-slate-800 bg-white/5 p-3 lg:block">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium">System nominal</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Edge listeners running across 3 regions.
        </p>
      </div>
    </aside>
  )
}