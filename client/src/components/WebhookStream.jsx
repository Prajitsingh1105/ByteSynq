import { webhookEvents } from '../lib/mock-data'

const styles = {
  POST: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30',
  GET: 'bg-sky-400/15 text-sky-300 ring-sky-400/30',
  PUT: 'bg-amber-400/15 text-amber-300 ring-amber-400/30',
  DELETE: 'bg-rose-400/15 text-rose-300 ring-rose-400/30'
}

export default function WebhookStream({ selectedId, onSelect }) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-white/5">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-4 py-3.5">
        <h2 className="text-xs font-semibold tracking-wider">INCOMING WEBHOOK STREAM</h2>
        <span className="rounded-md border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-rose-300">
          REDIS POWERED
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1.5">
          {webhookEvents.map((event) => {
            const selected = event.id === selectedId

            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelect(event.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_1px_rgba(52,211,153,.25),0_0_24px_rgba(52,211,153,.12)]'
                      : 'border-transparent bg-white/5 hover:border-slate-800 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex w-14 shrink-0 justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ring-1 ${styles[event.method]}`}
                    >
                      {event.method}
                    </span>
                    <span className="flex-1 truncate font-mono text-[13px]">{event.path}</span>
                    <span className="shrink-0 font-mono text-[11px] text-emerald-300">
                      {event.latency}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 pl-4.5">
                    <span className="shrink-0 font-mono text-[10px] text-slate-400">
                      {event.timestamp}
                    </span>
                    <span className="truncate font-mono text-[11px] text-slate-500">
                      {event.source}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}