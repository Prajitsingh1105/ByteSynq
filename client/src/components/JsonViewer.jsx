export default function JsonViewer({ data, isHeader = false }) {
  const syntaxHighlight = (json) => {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const highlighted = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = isHeader ? 'text-emerald-300' : 'text-emerald-400';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = isHeader ? 'text-purple-300' : 'text-sky-300';
            } else {
                cls = isHeader ? 'text-emerald-300' : 'text-amber-300';
            }
        } else if (/true|false/.test(match)) {
            cls = isHeader ? 'text-purple-400' : 'text-blue-400';
        } else if (/null/.test(match)) {
            cls = 'text-slate-400';
        }
        return `<span class="${cls}">${match}</span>`;
    });
    return highlighted;
  };

  return (
    <pre 
      className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300"
      dangerouslySetInnerHTML={{ __html: syntaxHighlight(data) }}
    />
  )
}