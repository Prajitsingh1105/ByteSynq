import { Bell, ChevronDown, Gauge } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-slate-800 bg-slate-950/70 px-4 backdrop-blur-xl lg:px-6">
      <div className="relative flex max-w-md flex-1 items-center">
        <input
          className="h-9 w-full rounded-lg border border-slate-800 bg-white/5 pl-3 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400/40"
          placeholder="Filter webhooks"
        />
      </div>

      <button className="hidden h-9 items-center gap-2 rounded-lg border border-slate-800 bg-white/5 px-3 text-sm sm:flex">
        <span className="size-2 rounded-full bg-emerald-400" />
        Production
        <ChevronDown className="size-3.5" />
      </button>

      <div className="ml-auto flex items-center gap-2 lg:gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 md:flex">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span className="text-xs">Active listeners 12</span>
        </div>

        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-white/5 px-3 py-1.5 lg:flex">
          <Gauge className="size-3.5 text-emerald-400" />
          <span className="text-xs">Cache Hit 98%</span>
        </div>

        <button className="relative flex size-9 items-center justify-center rounded-lg border border-slate-800 bg-white/5">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-400" />
        </button>

        <button className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-400/10 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
          JD
        </button>
      </div>
    </header>
  )
}