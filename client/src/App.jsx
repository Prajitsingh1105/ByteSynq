import { API_URL } from './config.js';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Plug, 
  Bell,
  Search,
  Code2,
  Webhook,
  LogOut,
  Edit2,
  BookOpen
} from 'lucide-react';
import DataStream from './components/DataStream';
import Dashboard from './components/Dashboard';
import Integrations from './components/Integrations';
import Settings from './components/Settings';
import Documentation from './components/Documentation';
import Auth from './components/Auth';
import ByteSynqLogo from './components/ByteSynqLogo';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState('stream');
  const [endpoints, setEndpoints] = useState([]);
  const [activeEndpointId, setActiveEndpointId] = useState(null);
  const [editingEndpointId, setEditingEndpointId] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_URL}/api/v1/auth/me`)
        .then(res => {
          if (res.data.success) setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchEndpoints() {
      try {
        const res = await axios.get(`${API_URL}/api/v1/endpoints`);
        if (res.data.success && res.data.endpoints.length > 0) {
          setEndpoints(res.data.endpoints);
          setActiveEndpointId(res.data.endpoints[0].endpointId);
        }
      } catch (err) {
        if (err.response?.status === 401) handleLogout();
        console.error("Failed to fetch endpoints", err);
      }
    }
    fetchEndpoints();
  }, [user]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('token', userData.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setEndpoints([]);
    setActiveEndpointId(null);
    toast.success("Logged out successfully");
  };

  const handleCreateEndpoint = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/v1/endpoints`);
      if (res.data.success) {
        setEndpoints([res.data.endpoint, ...endpoints]);
        setActiveEndpointId(res.data.endpoint.endpointId);
        setActiveView('stream');
        toast.success("Endpoint created!");
      }
    } catch (err) {
      console.error("Failed to create endpoint", err);
      toast.error("Failed to create endpoint");
    }
  };

  const activeEndpoint = endpoints.find(ep => ep.endpointId === activeEndpointId) || null;

  const updateEndpointInState = (updatedEndpoint) => {
    setEndpoints(prev => prev.map(ep => 
      ep.endpointId === updatedEndpoint.endpointId ? updatedEndpoint : ep
    ));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stream', label: 'Data Stream', icon: Activity },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    return (
      <>
        <div className={activeView === 'dashboard' ? 'block h-full w-full' : 'hidden'}>
          <Dashboard endpoint={activeEndpoint} />
        </div>
        <div className={activeView === 'stream' ? 'block h-full w-full' : 'hidden'}>
          <DataStream endpointId={activeEndpointId} />
        </div>
        <div className={activeView === 'integrations' ? 'block h-full w-full' : 'hidden'}>
          <Integrations endpoint={activeEndpoint} onUpdateEndpoint={updateEndpointInState} />
        </div>
        <div className={activeView === 'documentation' ? 'block h-full w-full' : 'hidden'}>
          <Documentation />
        </div>
        <div className={activeView === 'settings' ? 'block h-full w-full' : 'hidden'}>
          <Settings endpoint={activeEndpoint} onUpdateEndpoint={updateEndpointInState} />
        </div>
        {!['dashboard', 'stream', 'integrations', 'documentation', 'settings'].includes(activeView) && (
          <div className="flex items-center justify-center h-full text-slate-500 font-mono">
            View not found
          </div>
        )}
      </>
    );
  };

  if (authLoading) {
    return <div className="flex min-h-screen w-full bg-[#020617] items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-300 font-sans overflow-hidden">
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: '#0f172a', 
            color: '#e2e8f0', 
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '14px',
            fontFamily: 'monospace'
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } }
        }} 
      />
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#020617] flex flex-col z-10">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ByteSynqLogo className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ByteSynq</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <div className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wider">Overview</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:bg-[#0f172a]/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}
              </button>
            );
          })}
          
          <div className="mt-8 text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wider">Your Endpoints</div>
          {endpoints.length === 0 && (
            <div className="text-xs text-slate-600 px-3">No endpoints yet. Create one!</div>
          )}
          {endpoints.map((ep) => {
            const isEpActive = activeEndpointId === ep.endpointId && activeView === 'stream';
            const isEditing = editingEndpointId === ep.endpointId;
            return (
              <div
                key={ep.endpointId}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-sm font-mono ${
                  isEpActive && !isEditing
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-400 hover:bg-[#0f172a]/50 hover:text-slate-200'
                }`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        try {
                          const res = await axios.put(`${API_URL}/api/v1/endpoints/${ep.endpointId}/settings`, { name: editNameValue });
                          updateEndpointInState(res.data.endpoint);
                          setEditingEndpointId(null);
                          toast.success("Endpoint renamed");
                        } catch (err) { 
                          console.error(err); 
                          toast.error("Failed to rename endpoint");
                        }
                      } else if (e.key === 'Escape') {
                        setEditingEndpointId(null);
                      }
                    }}
                    onBlur={async () => {
                      if (editingEndpointId === ep.endpointId) {
                        try {
                          const res = await axios.put(`${API_URL}/api/v1/endpoints/${ep.endpointId}/settings`, { name: editNameValue });
                          updateEndpointInState(res.data.endpoint);
                          setEditingEndpointId(null);
                          toast.success("Endpoint renamed");
                        } catch (err) { 
                          console.error(err); 
                          setEditingEndpointId(null); 
                          toast.error("Failed to rename endpoint");
                        }
                      }
                    }}
                    className="bg-transparent border-b border-emerald-500 outline-none text-emerald-400 w-full"
                    placeholder="Enter name..."
                  />
                ) : (
                  <>
                    <button
                      onClick={() => { setActiveEndpointId(ep.endpointId); setActiveView('stream'); }}
                      className="flex items-center gap-3 w-full text-left truncate"
                    >
                      <Webhook className={`w-4 h-4 shrink-0 ${isEpActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="truncate">{ep.name || ep.endpointId}</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEndpointId(ep.endpointId);
                        setEditNameValue(ep.name || ep.endpointId);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity shrink-0 ml-2"
                      title="Rename Endpoint"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-[#0f172a]/50 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center border border-white/5 shrink-0">
                <span className="text-xs font-medium text-slate-300 uppercase">{user.email.substring(0,2)}</span>
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-sm font-medium text-slate-200 truncate">{user.email}</span>
                <span className="text-xs text-slate-500">Workspace Owner</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#020617] flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 hidden md:block">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search webhooks, endpoints, or logs..." 
                className="w-full bg-[#0f172a]/50 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder:text-slate-600 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/5 bg-[#0f172a] text-[10px] font-medium text-slate-400">
                  <span className="text-xs">⌘</span> K
                </kbd>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-[#0f172a]/50 rounded-lg transition-colors border border-transparent hover:border-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#020617]"></span>
            </button>
            <button onClick={handleCreateEndpoint} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              Create Endpoint
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Subtle gradient background element */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          {renderContent()}
        </div>
      </main>
    </div>
  );
}