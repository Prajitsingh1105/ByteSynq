import { Activity, ShieldCheck, Terminal, Repeat, Globe, LockKeyhole, Server, Cpu, Zap, Database, Plug, Code2 } from 'lucide-react';

export default function Features() {
  const features = [
    {
      title: "Real-time Inspection Engine",
      description: "Powered by Redis Pub/Sub and WebSockets, incoming webhooks hit your dashboard the exact millisecond they arrive. No polling, no refreshing. View headers, raw bodies, and parsed JSON instantly.",
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      title: "Secure Localhost Tunneling",
      description: "Skip ngrok. Use the ByteSynq CLI to securely tunnel webhooks directly to your local development environment. Perfect for testing Stripe webhooks against your local Node.js or Python server.",
      icon: Terminal,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "One-Click Webhook Replay",
      description: "Local server crashed? Deployment failed? Don't go back into your payment provider to trigger another test event. Replay any captured payload exactly as it arrived with a single click.",
      icon: Repeat,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Custom Mock Responses",
      description: "Need to return a specific 202 Accepted or 400 Bad Request to test third-party failure handling? Configure ByteSynq to return exactly the HTTP status code, headers, and JSON body you define.",
      icon: Code2,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Cryptographic Signatures",
      description: "Every webhook forwarded to your production servers is signed with an HMAC SHA-256 signature using your unique Endpoint Secret Key. Ensure requests are authentically from ByteSynq.",
      icon: ShieldCheck,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    },
    {
      title: "Zero-Logging Architecture",
      description: "Strict compliance requirements? Enable Zero-Logging mode. ByteSynq will act as a pure, low-latency proxy, forwarding payloads directly to your infrastructure without ever writing them to disk.",
      icon: Server,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Asynchronous Proxy Forwarding",
      description: "Route webhooks to multiple destinations simultaneously. ByteSynq handles the fan-out asynchronously, ensuring the sender gets an immediate 200 OK while your infrastructure processes at its own pace.",
      icon: Plug,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20"
    },
    {
      title: "Automated Data Retention",
      description: "Keep your workspace clean. Set automated retention policies (24 hours, 7 days, or 30 days) and let our background CRON engine securely purge stale data automatically.",
      icon: Database,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-8 no-scrollbar bg-[#020617] text-slate-300 scroll-smooth">
      <div className="max-w-6xl mx-auto space-y-16 pb-24">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm mb-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Zap className="w-4 h-4" /> The complete webhook toolkit
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8">
            Built for modern <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              engineering teams.
            </span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            From local debugging to production routing. ByteSynq provides everything you need to build, test, and scale webhook-driven architectures confidently.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-16">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-[#0f172a]/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-[#0f172a]/80 hover:border-white/10 transition-all group">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center border ${feature.border} shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture Highlight */}
        <div className="mt-24 bg-gradient-to-br from-[#0f172a] to-[#020617] border border-white/5 rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
           <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
           <div className="flex-1 relative z-10">
             <h3 className="text-3xl font-bold text-white mb-6">Blazing fast infrastructure.</h3>
             <p className="text-lg text-slate-400 leading-relaxed mb-8">
               ByteSynq is built on Node.js, Express, and Redis. It handles high-throughput webhook events seamlessly, ensuring your dashboard updates in real-time without skipping a beat, even during traffic spikes.
             </p>
             <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#020617] border border-white/5 text-sm font-medium text-slate-300">
                 <Server className="w-4 h-4 text-emerald-400" /> Node.js Backend
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#020617] border border-white/5 text-sm font-medium text-slate-300">
                 <Database className="w-4 h-4 text-red-400" /> Redis Pub/Sub
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#020617] border border-white/5 text-sm font-medium text-slate-300">
                 <Cpu className="w-4 h-4 text-blue-400" /> WebSockets
               </div>
             </div>
           </div>
           
           <div className="w-full md:w-1/3 shrink-0 relative z-10">
             <div className="bg-[#020617] rounded-2xl border border-white/10 p-6 shadow-2xl relative">
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10 rounded-2xl" />
               <div className="space-y-4 relative z-0">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className={`bg-[#0f172a] border border-white/5 p-4 rounded-xl flex items-center justify-between ${i > 2 ? 'opacity-30' : ''}`}>
                     <div className="flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="text-sm font-mono text-emerald-400">POST</span>
                     </div>
                     <span className="text-xs font-mono text-slate-500">{i * 12}ms</span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
