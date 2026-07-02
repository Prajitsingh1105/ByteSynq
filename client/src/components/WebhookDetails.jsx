import { CheckCircle2, Clock, Copy, Zap } from 'lucide-react'
import JsonViewer from './JsonViewer'
import MetricCards from './MetricCards'

const tabs = ['REQUEST BODY', 'HEADERS', 'METRICS', 'LOGS']

export default function WebhookDetails({ event, tab, setTab }) {
  return (
    <section className="flex min-h-0 flex-col gap-3 overflow-y-auto">
      <div className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex justify-center rounded-md bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
              {event.method}
            </span>
            <span className="font-mono text-sm">{event.path}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-400" /> {event.status} OK
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {event.timestamp}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="size-3.5" /> {event.latency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-slate-800 px-3 pt-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-t-md px-3 py-2 text-[11px] font-semibold tracking-wide ${
                tab === t ? 'text-emerald-300' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {t}
              <span
                className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full ${
                  tab === t ? 'bg-emerald-400' : 'bg-transparent'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'REQUEST BODY' && (
            <div className="relative">
              <button className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-slate-800 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                <Copy className="size-3" />
                Copy
              </button>
              <JsonViewer data={event.payload} />
            </div>
          )}

          {tab === 'HEADERS' && (
            <div className="relative">
              <JsonViewer data={event.headers} isHeader={true} />
            </div>
          )}

          {tab === 'METRICS' && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Latency', event.latency],
                ['Status', event.status],
                ['Source', event.source],
                ['Region', 'iad1']
              ].map((m) => (
                <div key={m[0]} className="rounded-xl border border-slate-800 bg-white/5 p-3">
                  <p className="text-[10px] font-semibold tracking-wider text-slate-400">{m[0]}</p>
                  <p className="mt-1 font-mono text-sm">{m[1]}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'LOGS' && (
            <div className="space-y-1.5 font-mono text-xs text-slate-300">
              <div>received {event.method} {event.path}</div>
              <div>signature verified from {event.source}</div>
              <div>published to redis channel</div>
              <div>fanned out in {event.latency}</div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <MetricCards />
      </div>
    </section>
  )
}