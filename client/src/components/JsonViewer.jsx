export default function JsonViewer({ data }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}