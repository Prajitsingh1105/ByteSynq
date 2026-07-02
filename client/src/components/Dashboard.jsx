import { API_URL } from '../config.js';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Activity, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

export default function Dashboard({ endpoint }) {
  const [volumeData, setVolumeData] = useState([]);
  const [globalVolumeData, setGlobalVolumeData] = useState([]);
  const [statusCodeData, setStatusCodeData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalEvents: '0',
    successRate: '0%',
    avgLatency: '0ms'
  });
  const [globalMetrics, setGlobalMetrics] = useState({
    totalEvents: '0',
    successRate: '0%',
    avgLatency: '0ms'
  });

  useEffect(() => {
    async function fetchAnalytics() {
      if (!endpoint) return;
      try {
        const [endpointRes, globalRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/endpoints/${endpoint.endpointId}/analytics`),
          axios.get(`${API_URL}/api/v1/analytics/global`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        if (endpointRes.data.success) {
          const formattedVolumeData = (endpointRes.data.volumeData || []).map(d => ({
            ...d,
            time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setVolumeData(formattedVolumeData);
          setStatusCodeData(endpointRes.data.statusCodeData || []);
          setMetrics({
            totalEvents: endpointRes.data.totalEvents?.toString() || '0',
            successRate: endpointRes.data.successRate || '0%',
            avgLatency: endpointRes.data.avgLatency || '0ms'
          });
        }

        if (globalRes.data.success) {
          const formattedGlobalVolume = (globalRes.data.volumeData || []).map(d => ({
            ...d,
            time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setGlobalVolumeData(formattedGlobalVolume);
          setGlobalMetrics({
            totalEvents: globalRes.data.totalEvents?.toString() || '0',
            successRate: globalRes.data.successRate || '0%',
            avgLatency: globalRes.data.avgLatency || '0ms'
          });
        }

      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    }
    
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [endpoint]);
  return (
    <div className="h-full overflow-y-auto p-8 no-scrollbar bg-[#020617]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-sans font-bold text-white mb-2">
            Dashboard Overview {endpoint && <span className="text-emerald-400 font-mono text-xl">({endpoint.endpointId})</span>}
          </h1>
          <p className="text-slate-400 font-sans">Monitor your webhook infrastructure in real-time.</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Global Total Events', value: globalMetrics.totalEvents, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Global Success Rate', value: globalMetrics.successRate, icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Endpoint Total Events', value: metrics.totalEvents, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Endpoint Success Rate', value: metrics.successRate, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden group">
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <p className="text-slate-400 font-sans text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl font-mono font-semibold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg border border-white/5 ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Webhook Volume Chart */}
        <div className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-sans font-semibold text-white">Global Webhook Volume (All Endpoints, 24h)</h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                Live
              </span>
            </div>
          </div>
          <div className="h-72 w-full font-mono text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={globalVolumeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGlobalVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', color: '#e2e8f0' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGlobalVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area Chart */}
          <div className="lg:col-span-2 bg-[#0f172a]/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-semibold text-white">Endpoint Volume ({endpoint?.name || endpoint?.endpointId})</h2>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  Live
                </span>
              </div>
            </div>
            <div className="h-72 w-full font-mono text-sm">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', color: '#e2e8f0' }}
                    itemStyle={{ color: '#10b981', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-sans font-semibold text-white mb-6">Status Codes</h2>
            <div className="h-72 w-full font-mono text-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCodeData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="code" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={85} />
                  <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {statusCodeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
