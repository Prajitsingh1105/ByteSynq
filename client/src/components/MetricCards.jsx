import { Activity, TrendingUp } from 'lucide-react'
import { latencySamples, rpmSamples } from '../lib/mock-data'

const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2)

export default function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-white/5 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[11px] font-semibold tracking-wider text-slate-400">
              REDIS PUBSUB LATENCY
            </h3>
            <p className="mt-1 font-mono text-2xl font-semibold">
              {avg(latencySamples)} <span className="text-sm font-normal text-slate-400">ms avg</span>
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-400/25">
            <TrendingUp className="size-3" /> stable
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-white/5 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[11px] font-semibold tracking-wider text-slate-400">
              ENDPOINT LOAD RPM
            </h3>
            <p className="mt-1 font-mono text-2xl font-semibold">
              {rpmSamples.at(-1)} <span className="text-sm font-normal text-slate-400">req/min</span>
            </p>
          </div>
          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/25">
            <Activity className="size-3.5 text-emerald-400" />
          </span>
        </div>
      </div>
    </div>
  )
}