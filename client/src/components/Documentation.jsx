import { useState, useEffect } from 'react';
import { BookOpen, Zap, Plug, ShieldCheck, Repeat, Terminal, Copy, CheckCircle2, ChevronRight, Hash, Database } from 'lucide-react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-medium"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('quick-start');

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const navItems = [
    { id: 'quick-start', label: 'Quick Start', icon: Zap },
    { id: 'proxy-forwarding', label: 'Proxy Forwarding', icon: Plug },
    { id: 'mock-responses', label: 'Mock Responses', icon: Terminal },
    { id: 'webhook-replay', label: 'Webhook Replay', icon: Repeat },
    { id: 'cli-tunneling', label: 'CLI Tunneling', icon: Terminal },
    { id: 'security', label: 'Security & Data', icon: ShieldCheck },
  ];

  // Intersection Observer for highlighting TOC (simplified)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -80% 0px' });

    navItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full flex overflow-hidden bg-[#020617] text-slate-300">
      
      {/* Fixed Table of Contents Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-white/5 p-8 h-full overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-white tracking-wide">Developer Docs</span>
        </div>
        
        <div className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {item.label}
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto no-scrollbar p-8 lg:p-12 pb-32 scroll-smooth">
        
        <div className="max-w-4xl mx-auto space-y-24">
          {/* Header */}
        <div className="relative">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
            Enterprise-grade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              webhook inspection.
            </span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
            ByteSynq allows you to capture, inspect, replay, and securely forward real-time HTTP requests 
            to your local development environment or production servers.
          </p>
        </div>

        {/* 1. Quick Start */}
        <section id="quick-start" className="scroll-mt-12 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">1. Quick Start</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-[#0f172a]/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">1</span>
                <h3 className="text-xl font-semibold text-white">Generate an Endpoint</h3>
              </div>
              <p className="text-slate-400 mb-4 ml-11">Navigate to your Dashboard and click <strong>Create Endpoint</strong>. ByteSynq will instantly generate a unique, secure URL. Copy this URL to your clipboard.</p>
            </div>
            
            <div className="bg-[#0f172a]/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">2</span>
                <h3 className="text-xl font-semibold text-white">Fire a Webhook</h3>
              </div>
              <div className="ml-11">
                <p className="text-slate-400 mb-4">Paste your ByteSynq URL into any third-party service (Stripe, GitHub, Shopify) or trigger a test request using cURL:</p>
                <div className="bg-[#020617] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative group">
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={`curl -X POST https://api.bytesynq.dev/catch/req_9f82h \\\n  -H "Content-Type: application/json" \\\n  -d '{"message": "Hello ByteSynq!"}'`} />
                  </div>
                  <div className="flex items-center px-4 py-2 bg-slate-900 border-b border-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                  </div>
                  <div className="p-4 font-mono text-sm overflow-x-auto">
                    <span className="text-emerald-400">$</span> <span className="text-slate-300">curl -X POST https://api.bytesynq.dev/catch/req_9f82h \</span> <br/>
                    &nbsp;&nbsp;<span className="text-slate-300">-H</span> <span className="text-amber-300">"Content-Type: application/json"</span> <span className="text-slate-300">\</span> <br/>
                    &nbsp;&nbsp;<span className="text-slate-300">-d</span> <span className="text-amber-300">'{"{"}"message": "Hello ByteSynq!"{"}"}'</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a]/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center text-sm font-bold text-emerald-400">3</span>
                <h3 className="text-xl font-semibold text-white">Watch it Live</h3>
              </div>
              <p className="text-slate-400 ml-11">Open the <strong>Data Stream</strong> tab. Thanks to our Redis and WebSocket infrastructure, your webhook will appear in milliseconds—no page refresh required. Click on the event to inspect the raw JSON payload, HTTP headers, and processing latency.</p>
            </div>
          </div>
        </section>

        {/* 2. Proxy Forwarding */}
        <section id="proxy-forwarding" className="scroll-mt-12 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Plug className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">2. Proxy Forwarding</h2>
          </div>
          <p className="text-lg text-slate-400">ByteSynq acts as a secure middleman, catching webhooks and instantly forwarding them to your own API infrastructure asynchronously.</p>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-white/5 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Plug className="w-48 h-48" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 relative z-10">Configuring a Proxy Target</h3>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start gap-3 text-slate-400">
                  <ChevronRight className="w-5 h-5 text-blue-400 shrink-0" /> Go to the Integrations tab.
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <ChevronRight className="w-5 h-5 text-blue-400 shrink-0" /> Enter your destination URL in the Custom Proxy Target field.
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <ChevronRight className="w-5 h-5 text-blue-400 shrink-0" /> Select which HTTP methods to forward.
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <ChevronRight className="w-5 h-5 text-blue-400 shrink-0" /> Click Save. All future webhooks will automatically be forwarded.
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Verifying Webhook Signatures</h3>
              <p className="text-slate-400">
                To ensure forwarded requests legitimately came from ByteSynq and weren't spoofed, every outbound proxy request includes an HMAC-SHA256 signature in the headers.
              </p>
              
              <div className="bg-[#020617] p-5 rounded-xl border border-white/5 font-mono text-sm grid gap-3 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded w-fit">X-ByteSynq-Signature</span>
                  <span className="text-slate-400">The cryptographic hash of the payload.</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded w-fit">X-ByteSynq-Forwarded-From</span>
                  <span className="text-slate-400">Your unique Endpoint ID.</span>
                </div>
              </div>

              <div className="bg-[#020617] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative group mt-6">
                <div className="flex items-center px-4 py-3 bg-[#0f172a] border-b border-white/5 justify-between">
                   <div className="text-xs text-slate-400 font-medium">verify-webhook.js</div>
                   <CopyButton text={`const crypto = require('crypto');\n\nfunction verifyByteSynqWebhook(req, res, next) {\n  const secretKey = process.env.BYTESYNQ_SECRET;\n  const signature = req.headers['x-bytesynq-signature'];\n  const expectedSignature = crypto.createHmac('sha256', secretKey).update(JSON.stringify(req.body)).digest('hex');\n  if (signature !== expectedSignature) {\n    return res.status(401).json({ error: 'Invalid Webhook Signature' });\n  }\n  next();\n}`} />
                </div>
                <div className="p-6 font-mono text-sm overflow-x-auto leading-loose">
<pre className="text-slate-300">
<span className="text-purple-400">const</span> crypto = <span className="text-blue-400">require</span>(<span className="text-amber-300">'crypto'</span>);

<span className="text-purple-400">function</span> <span className="text-emerald-400">verifyByteSynqWebhook</span>(req, res, next) {"{"}
  <span className="text-slate-500 italic">// 1. Get your Endpoint's Secret Key</span>
  <span className="text-purple-400">const</span> secretKey = process.env.BYTESYNQ_SECRET; 
  
  <span className="text-slate-500 italic">// 2. Get the signature from the headers</span>
  <span className="text-purple-400">const</span> signature = req.headers[<span className="text-amber-300">'x-bytesynq-signature'</span>];
  
  <span className="text-slate-500 italic">// 3. Hash the raw request body</span>
  <span className="text-purple-400">const</span> expectedSignature = crypto
    .createHmac(<span className="text-amber-300">'sha256'</span>, secretKey)
    .update(<span className="text-emerald-400">JSON</span>.stringify(req.body))
    .digest(<span className="text-amber-300">'hex'</span>);

  <span className="text-slate-500 italic">// 4. Compare</span>
  <span className="text-purple-400">if</span> (signature !== expectedSignature) {"{"}
    <span className="text-purple-400">return</span> res.status(<span className="text-amber-400">401</span>).json({"{"} <span className="text-blue-300">error</span>: <span className="text-amber-300">'Invalid Signature'</span> {"}"});
  {"}"}
  <span className="text-emerald-400">next</span>();
{"}"}
</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Custom Mock Responses */}
        <section id="mock-responses" className="scroll-mt-12 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">3. Custom Mock Responses</h2>
          </div>
          <div className="bg-[#0f172a]/50 p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Sometimes third-party services require a specific HTTP response to confirm receipt. 
                You can configure ByteSynq to respond exactly how you need it to without hitting your own backend.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-400">
                  <Hash className="w-5 h-5 text-purple-400 shrink-0" /> Define your desired HTTP Status Code (e.g., 200, 202, or 400).
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <Hash className="w-5 h-5 text-purple-400 shrink-0" /> Provide a custom JSON body and add any required custom headers.
                </li>
              </ul>
            </div>
            <div className="w-full md:w-64 bg-[#020617] rounded-xl p-4 border border-white/10 shadow-2xl shrink-0">
               <div className="text-xs text-slate-500 mb-2">Mock Configuration</div>
               <div className="text-sm text-emerald-400 font-mono mb-2">HTTP 200 OK</div>
               <pre className="text-xs font-mono text-slate-300 bg-white/5 p-3 rounded-lg">
{`{
  "received": true,
  "status": "success"
}`}
               </pre>
            </div>
          </div>
        </section>

        {/* 4. Webhook Replay */}
        <section id="webhook-replay" className="scroll-mt-12 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Repeat className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">4. Webhook Replay</h2>
          </div>
          <p className="text-lg text-slate-400">
            If your local server crashes or a deployment fails, you don't need to go back into Stripe to manually trigger another test event.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-[#0f172a] p-6 rounded-xl border border-white/5 text-center">
               <div className="w-10 h-10 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4 text-white font-bold">1</div>
               <div className="text-slate-300 font-medium">Open captured payload</div>
            </div>
            <div className="bg-[#0f172a] p-6 rounded-xl border border-white/5 text-center">
               <div className="w-10 h-10 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4 text-white font-bold">2</div>
               <div className="text-slate-300 font-medium">Click Replay button</div>
            </div>
            <div className="bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/20 text-center">
               <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 font-bold">3</div>
               <div className="text-emerald-400 font-medium">Instantly re-triggered</div>
            </div>
          </div>
        </section>

        {/* 5. Localhost CLI Tunneling */}
        <section id="cli-tunneling" className="scroll-mt-12 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">5. Localhost CLI Tunneling</h2>
          </div>
          <p className="text-lg text-slate-400">
            Develop and debug webhooks locally without exposing your machine to the internet. 
            The ByteSynq CLI connects to your workspace via WebSockets and tunnels traffic directly to your local ports.
          </p>
          
          <div className="bg-[#020617] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
            <div className="flex items-center px-4 py-2 bg-slate-900 border-b border-white/5 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs text-slate-500 font-mono">zsh</div>
            </div>
            <div className="p-6 font-mono text-sm overflow-x-auto leading-loose">
              <span className="text-slate-500"># Install the CLI globally</span><br/>
              <span className="text-cyan-400">$</span> <span className="text-slate-300">npm install -g bytesynq-cli</span><br/><br/>
              <span className="text-slate-500"># Start listening to your endpoint and forward traffic to port 3000</span><br/>
              <span className="text-cyan-400">$</span> <span className="text-slate-300">bytesynq listen --endpoint req_9f82h --port 3000</span><br/><br/>
              <span className="text-emerald-400">✔</span> <span className="text-slate-400">Connected to ByteSynq Server</span><br/>
              <span className="text-emerald-400">✔</span> <span className="text-slate-400">Tunneling traffic to http://localhost:3000</span>
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200/80">
              <strong className="text-amber-400">Security Note:</strong> You will be prompted to enter your Endpoint Secret Key upon first run to authenticate the WebSocket connection.
            </p>
          </div>
        </section>

        {/* 6. Security & Data Management */}
        <section id="security" className="scroll-mt-12 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">6. Security & Data Management</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-400" /> Secret Key Rotation
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                If you suspect your Endpoint Secret Key has been compromised, go to <strong>Settings &gt; API Keys</strong> and click <strong>Regenerate</strong>. Your old key will be invalidated immediately, ensuring malicious actors cannot forge signatures.
              </p>
            </div>
            
            <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" /> Data Retention
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                ByteSynq stores your history securely so you can debug past events. Configure your automated retention policy in Settings (24 hours, 7 days, or 30 days). A background engine will safely purge payloads older than your threshold.
              </p>
            </div>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
