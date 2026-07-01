import { API_URL } from '../config.js';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, Zap, Clock, Terminal, ChevronRight, Webhook, Search, Filter, ShieldAlert, Copy, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

const mockWebhooks = [
  {
    id: 'req_39fjd82kx',
    method: 'POST',
    path: '/api/v1/payments/stripe/webhook',
    timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
    latency: '124ms',
    status: 200,
    headers: {
      'host': 'api.bytesynq.io',
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      'stripe-signature': 't=1678912345,v1=...signature_hash...',
      'content-type': 'application/json',
      'x-request-id': 'req_39fjd82kx'
    },
    payload: {
      "id": "evt_1MvXYZ2eZvKYlo2C",
      "object": "event",
      "api_version": "2022-11-15",
      "created": 1678912345,
      "data": {
        "object": {
          "id": "cs_test_a1b2c3d4",
          "object": "checkout.session",
          "amount_total": 4900,
          "currency": "usd",
          "payment_status": "paid"
        }
      },
      "type": "checkout.session.completed"
    }
  },
  {
    id: 'req_84nxu93ma',
    method: 'POST',
    path: '/api/v1/github/push',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    latency: '82ms',
    status: 201,
    headers: {
      'host': 'api.bytesynq.io',
      'user-agent': 'GitHub-Hookshot/624b547',
      'x-github-event': 'push',
      'x-hub-signature-256': 'sha256=...hash...',
      'content-type': 'application/json'
    },
    payload: {
      "ref": "refs/heads/main",
      "before": "9049f1265b7d61be4a8904a9a27120d2064dab3b",
      "after": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
      "repository": {
        "id": 1296269,
        "name": "Hello-World",
        "full_name": "octocat/Hello-World"
      },
      "commits": [
        {
          "id": "0d1a26e67d8f5eaf1f6ba5c57fc3c7d91ac0fd1c",
          "message": "Update README.md"
        }
      ]
    }
  },
  {
    id: 'req_22plq10bc',
    method: 'POST',
    path: '/api/v1/shopify/orders/create',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    latency: '412ms',
    status: 200,
    headers: {
      'host': 'api.bytesynq.io',
      'user-agent': 'Shopify/1.0',
      'x-shopify-topic': 'orders/create',
      'x-shopify-shop-domain': 'test-shop.myshopify.com',
      'content-type': 'application/json'
    },
    payload: {
      "id": 820982911946154500,
      "email": "jon@example.com",
      "created_at": "2023-10-15T12:00:00-04:00",
      "number": 234,
      "total_price": "23.00",
      "currency": "USD"
    }
  },
  {
    id: 'req_99zm14klo',
    method: 'POST',
    path: '/api/v1/twilio/sms',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    latency: '35ms',
    status: 200,
    headers: {
      'host': 'api.bytesynq.io',
      'user-agent': 'TwilioProxy/1.1',
      'content-type': 'application/x-www-form-urlencoded'
    },
    payload: {
      "ToCountry": "US",
      "SmsStatus": "received",
      "Body": "Hello world from Twilio!",
      "To": "+1234567890",
      "From": "+0987654321"
    }
  },
  {
    id: 'req_11xy83pqx',
    method: 'PUT',
    path: '/api/v1/custom/sync',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    latency: '850ms',
    status: 500,
    headers: {
      'host': 'api.bytesynq.io',
      'user-agent': 'CustomApp/2.0',
      'authorization': 'Bearer ...token...',
      'content-type': 'application/json'
    },
    payload: {
      "action": "full_sync",
      "entities": ["users", "settings", "preferences"],
      "force": true
    }
  }
];

const mockMetricsData = [
  { time: '0ms', latency: 12 },
  { time: '20ms', latency: 15 },
  { time: '40ms', latency: 14 },
  { time: '60ms', latency: 28 },
  { time: '80ms', latency: 45 },
  { time: '100ms', latency: 32 },
  { time: '120ms', latency: 18 },
];

export default function DataStream({ endpointId }) {
  const [webhooks, setWebhooks] = useState([]);
  const [activeWebhook, setActiveWebhook] = useState(null);
  const [activeTab, setActiveTab] = useState('REQUEST BODY');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [replayStatus, setReplayStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!activeWebhook) return;
    navigator.clipboard.writeText(JSON.stringify(activeWebhook.payload, null, 2));
    setCopied(true);
    toast.success("Payload copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (activeTab === 'METRICS' && endpointId) {
      axios.get(`${API_URL}/api/v1/endpoints/${endpointId}/analytics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => {
        if (res.data.success) {
          const formattedData = {
            ...res.data,
            volumeData: (res.data.volumeData || []).map(d => ({
              ...d,
              time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          };
          setAnalytics(formattedData);
        }
      })
      .catch(err => console.error("Failed to fetch analytics", err));
    }
  }, [activeTab, endpointId]);

  const handleReplay = async () => {
    if (!activeWebhook || !endpointId) return;
    
    setReplayStatus('loading');
    try {
      const res = await axios.post(`${API_URL}/api/v1/endpoints/${endpointId}/webhooks/${activeWebhook.id}/replay`);
      if (res.data.success) {
        setReplayStatus('success');
        toast.success("Webhook replayed successfully");
      } else {
        setReplayStatus('error');
        toast.error("Failed to replay webhook");
      }
    } catch (err) {
      console.error('Failed to replay webhook', err);
      setReplayStatus('error');
      toast.error("Failed to replay webhook");
    }
    
    setTimeout(() => {
      setReplayStatus(null);
    }, 3000);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!endpointId) return;

    async function fetchWebhooks() {
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (methodFilter !== 'ALL') params.append('method', methodFilter);
        if (statusFilter !== 'ALL') params.append('status', statusFilter);

        const res = await axios.get(`${API_URL}/api/v1/endpoints/${endpointId}/webhooks?${params.toString()}`);
        if (res.data.success) {
          setWebhooks(res.data.webhooks);
          if (res.data.webhooks.length > 0) {
            setActiveWebhook(prev => prev ? res.data.webhooks.find(w => w.id === prev.id) || res.data.webhooks[0] : res.data.webhooks[0]);
          } else {
            setActiveWebhook(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch webhooks", err);
      }
    }
    fetchWebhooks();
  }, [endpointId, debouncedSearch, methodFilter, statusFilter]);

  useEffect(() => {
    if (!endpointId) return;

    // Connect strictly to the backend port
    const socket = io(`${API_URL}`); 

    socket.on('connect', () => {
      console.log('🟢 React successfully connected to ByteSynq Backend!');
      socket.emit('join_endpoint', endpointId);
    });

    socket.on('new_webhook', (data) => {
      setWebhooks(prev => {
        if (prev.some(w => w.id === data.id)) {
          return prev;
        }
        const updated = [data, ...prev];
        return updated.slice(0, 50); 
      });
      setActiveWebhook(prev => prev || data);
    });

    return () => socket.disconnect();
  }, [endpointId]);

  const tabs = ['REQUEST BODY', 'HEADERS', 'METRICS'];

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
  };

  const lastSyncTime = webhooks.length > 0 
    ? new Date(webhooks[0].time || webhooks[0].timestamp).toLocaleTimeString() 
    : 'Never';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'REQUEST BODY':
        return (
          <div className="flex flex-col h-full gap-4">
            <div className="bg-[#020617] rounded-xl p-6 font-mono text-sm flex flex-col flex-1 border border-white/5 shadow-inner overflow-hidden">
              {activeWebhook.validationError && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-sans text-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldAlert className="w-4 h-4" /> Schema Validation Failed
                  </div>
                  <div className="font-mono text-xs">{activeWebhook.validationError}</div>
                </div>
              )}
              
              <div className="relative group flex-1 bg-[#050b14] rounded-lg border border-white/5 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-[#0a1120] border-b border-white/5">
                  <span className="text-xs font-sans font-medium text-slate-500 uppercase tracking-wider">JSON Payload</span>
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-xs font-sans font-medium">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 overflow-auto flex-1">
                  <pre className="text-emerald-400/90 text-xs sm:text-sm font-mono leading-relaxed">
                    <code>{JSON.stringify(activeWebhook.payload, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>
            
            {/* System Logs Section */}
            <div className="bg-[#0f172a]/40 rounded-xl p-5 border border-white/5 flex-shrink-0">
              <h4 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" /> Event Logs
              </h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-start gap-3">
                  <span className="text-slate-500">[{formatTime(activeWebhook.time || activeWebhook.timestamp)}]</span>
                  <span className="text-slate-300">Webhook intercepted from {activeWebhook.headers['user-agent'] || 'Unknown Client'}</span>
                </div>
                {activeWebhook.validationError ? (
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500">[{formatTime(activeWebhook.time || activeWebhook.timestamp)}]</span>
                    <span className="text-red-400">Schema validation rejected payload</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500">[{formatTime(activeWebhook.time || activeWebhook.timestamp)}]</span>
                    <span className="text-emerald-400">Payload processed in {activeWebhook.latency}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-slate-500">[{formatTime(activeWebhook.time || activeWebhook.timestamp)}]</span>
                  <span className={activeWebhook.status >= 400 ? "text-yellow-400" : "text-blue-400"}>
                    Responded to client with status {activeWebhook.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'HEADERS':
        return (
          <div className="flex flex-col h-full bg-[#050b14] rounded-xl border border-white/5 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0a1120] border-b border-white/5 shrink-0">
              <span className="text-xs font-sans font-medium text-slate-500 uppercase tracking-wider">
                HTTP Headers <span className="ml-2 bg-[#0f172a] text-slate-400 px-1.5 py-0.5 rounded border border-white/10">{Object.keys(activeWebhook.headers).length}</span>
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activeWebhook.headers, null, 2));
                  setCopied(true);
                  toast.success("Headers copied to clipboard");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-xs font-sans font-medium">{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-white/5">
                  {Object.entries(activeWebhook.headers).map(([key, value]) => (
                    <tr key={key} className="hover:bg-[#0f172a]/50 transition-colors group">
                      <td className="px-6 py-4 w-1/3 align-top">
                        <span className="font-mono text-xs text-slate-400 bg-white/[0.02] border border-white/5 px-2 py-1 rounded">
                          {key}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-emerald-400/90 break-all align-top group-hover:text-emerald-400 transition-colors">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'METRICS':
        return (
          <div className="h-full flex flex-col gap-6">
            <div className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-sans font-semibold text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Webhook Volume (Last 24h)
                </h3>
                {analytics && (
                  <div className="text-xs text-slate-400 font-mono">
                    Avg Latency: <span className="text-emerald-400">{analytics.avgLatency}</span> | 
                    Total: <span className="text-emerald-400">{analytics.totalEvents}</span> | 
                    Success Rate: <span className="text-emerald-400">{analytics.successRate}</span>
                  </div>
                )}
              </div>
              <div className="h-64 w-full font-mono text-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.volumeData || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', color: '#e2e8f0' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} dot={{ fill: '#020617', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-slate-200 font-sans font-medium">MongoDB Sync Status</h4>
                  <p className="text-sm text-slate-500 font-mono mt-1">Last synchronized: {lastSyncTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-sm font-sans font-medium">
                  {webhooks.length > 0 ? 'Connected & Syncing' : 'Waiting for data...'}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[#020617]">
      
      {/* Left Column: Stream List */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-r border-white/5 bg-[#0f172a]/20 flex flex-col h-full z-10">
        <div className="p-4 border-b border-white/5 bg-[#0f172a]/40 backdrop-blur-sm flex flex-col gap-3">
          <h2 className="text-xs font-sans font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Incoming Webhook Stream
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search path, method, id..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#020617] border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-600"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={methodFilter} 
              onChange={e => setMethodFilter(e.target.value)}
              className="bg-[#020617] border border-white/5 rounded-lg px-2 py-1.5 text-xs text-slate-400 focus:outline-none flex-1"
            >
              <option value="ALL">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#020617] border border-white/5 rounded-lg px-2 py-1.5 text-xs text-slate-400 focus:outline-none flex-1"
            >
              <option value="ALL">All Status</option>
              <option value="200">200 OK</option>
              <option value="201">201 Created</option>
              <option value="400">400 Bad Req</option>
              <option value="404">404 Not Found</option>
              <option value="500">500 Error</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {webhooks.length === 0 && (
            <div className="text-sm text-slate-500 font-mono text-center mt-10">No requests captured yet</div>
          )}
          {webhooks.map((webhook) => {
            const isActive = activeWebhook?.id === webhook.id;
            const isError = webhook.status >= 400;
            const statusColor = isError ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10';
            const methodColor = webhook.method === 'POST' ? 'text-blue-400' : 'text-purple-400';

            return (
              <div 
                key={webhook.id}
                onClick={() => setActiveWebhook(webhook)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border relative group ${
                  isActive 
                    ? 'bg-[#0f172a]/80 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                    : 'bg-[#0f172a]/40 border-white/5 hover:bg-[#0f172a]/60 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md ${methodColor} bg-[#020617] border border-white/5`}>
                      {webhook.method}
                    </span>
                    <span className="text-sm font-mono font-medium text-slate-300 truncate max-w-[180px]">
                      {webhook.path}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono mt-1">
                    {formatTime(webhook.time || webhook.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-md border border-white/5 ${statusColor}`}>
                      {webhook.status}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {webhook.latency}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-emerald-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Details Pane */}
      <div className="flex-1 flex flex-col bg-[#020617] h-full overflow-hidden">
        {!activeWebhook ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
             <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
               <Webhook className="w-8 h-8 text-slate-600" />
             </div>
             <h3 className="text-lg font-medium text-slate-300 mb-2 font-mono">Waiting for Webhooks</h3>
             <p className="text-sm text-slate-500 max-w-md">
               Send a request to <br/>
               <code className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded mt-2 inline-block break-all">
                 ${API_URL}/api/v1/catch/{endpointId || 'your-endpoint-id'}
               </code>
             </p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="p-8 border-b border-white/5 bg-[#0f172a]/20">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <h1 className="text-2xl font-bold text-white font-mono break-all">{activeWebhook.path}</h1>
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                      {activeWebhook.status} OK
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-mono flex items-center gap-4">
                    <span>ID: <span className="text-slate-300">{activeWebhook.id}</span></span>
                    <span className="text-slate-600">•</span>
                    <span>Time: {new Date(activeWebhook.timestamp || activeWebhook.time).toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleReplay}
                    disabled={replayStatus === 'loading'}
                    className={`px-4 py-2 bg-[#0f172a] hover:bg-[#0f172a]/80 text-slate-300 text-sm font-sans font-medium rounded-lg border border-white/5 transition-colors flex items-center gap-2 disabled:opacity-50 ${replayStatus === 'success' ? 'text-emerald-400 border-emerald-500/50' : replayStatus === 'error' ? 'text-red-400 border-red-500/50' : ''}`}
                  >
                    <Terminal className="w-4 h-4" /> 
                    {replayStatus === 'loading' ? 'Replaying...' : replayStatus === 'success' ? 'Replayed!' : replayStatus === 'error' ? 'Failed' : 'Replay'}
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-white/5 mt-8">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-sans font-medium transition-all relative ${
                      activeTab === tab 
                        ? 'text-emerald-400' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-8 overflow-hidden">
              {renderTabContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
