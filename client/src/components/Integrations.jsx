import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GitBranch, CreditCard, ShoppingCart, MessageSquare, CheckCircle2, ArrowRight, Save, Network, X } from 'lucide-react';

export default function Integrations({ endpoint, onUpdateEndpoint }) {
  const [forwardUrl, setForwardUrl] = useState(endpoint?.forwardUrl || '');
  const [activeConfigId, setActiveConfigId] = useState(null);
  const [integrationSecret, setIntegrationSecret] = useState('');

  useEffect(() => {
    if (endpoint) {
      setForwardUrl(endpoint.forwardUrl);
    }
  }, [endpoint]);

  const handleSaveForwardUrl = async () => {
    if (!endpoint) return;
    try {
      const res = await axios.patch(`http://localhost:3001/api/v1/endpoints/${endpoint.endpointId}/settings`, {
        retentionDays: endpoint.retentionDays,
        forwardUrl: forwardUrl
      });
      if (res.data.success) {
        onUpdateEndpoint(res.data.endpoint);
        toast.success("Destination saved successfully");
      }
    } catch (err) {
      console.error("Failed to save forward URL", err);
      toast.error("Failed to save destination");
    }
  };

  const handleSaveIntegration = async () => {
    if (!endpoint || !activeConfigId) return;
    try {
      const existingIntegrations = [...(endpoint.integrations || [])];
      const existingIdx = existingIntegrations.findIndex(i => i.provider === activeConfigId);
      if (existingIdx >= 0) {
        existingIntegrations[existingIdx] = { provider: activeConfigId, secret: integrationSecret, isActive: true };
      } else {
        existingIntegrations.push({ provider: activeConfigId, secret: integrationSecret, isActive: true });
      }

      const res = await axios.patch(`http://localhost:3001/api/v1/endpoints/${endpoint.endpointId}/settings`, {
        integrations: existingIntegrations
      });
      if (res.data.success) {
        onUpdateEndpoint(res.data.endpoint);
        setActiveConfigId(null);
        setIntegrationSecret('');
        toast.success("Integration saved successfully");
      }
    } catch (err) {
      console.error("Failed to save integration", err);
      toast.error("Failed to save integration");
    }
  };

  const handleDisableIntegration = async (provider) => {
    if (!endpoint) return;
    try {
      const existingIntegrations = [...(endpoint.integrations || [])];
      const existingIdx = existingIntegrations.findIndex(i => i.provider === provider);
      if (existingIdx >= 0) {
        existingIntegrations[existingIdx].isActive = false;
        
        const res = await axios.patch(`http://localhost:3001/api/v1/endpoints/${endpoint.endpointId}/settings`, {
          integrations: existingIntegrations
        });
        if (res.data.success) {
          onUpdateEndpoint(res.data.endpoint);
          toast.success("Integration disabled");
        }
      }
    } catch (err) {
      console.error("Failed to disable integration", err);
      toast.error("Failed to disable integration");
    }
  };

  const integrations = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Sync payment events, subscriptions, and invoice data in real-time.',
      icon: CreditCard,
      status: 'connected',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Listen to push events, PR updates, and repository activity.',
      icon: GitBranch,
      status: 'configure',
      color: 'text-slate-200',
      bg: 'bg-slate-700/50'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Process order creation, fulfillment, and inventory updates.',
      icon: ShoppingCart,
      status: 'connected',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Handle SMS delivery receipts, incoming messages, and call status.',
      icon: MessageSquare,
      status: 'configure',
      color: 'text-red-400',
      bg: 'bg-red-500/10'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-8 no-scrollbar bg-[#020617]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-sans font-bold text-white mb-2">Integrations</h1>
          <p className="text-slate-400 font-sans">Connect external services to route and process webhooks automatically.</p>
        </div>

        {/* Custom Proxy Section */}
        <section className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Network className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-sans font-semibold text-white">Custom Webhook Proxy</h2>
              <p className="text-sm text-slate-400">Forward all captured webhooks to your own external service with a verified HMAC-SHA256 signature.</p>
            </div>
          </div>
          
          <div className="max-w-2xl flex gap-3">
            <input
              type="text"
              placeholder="https://your-api.com/webhook"
              value={forwardUrl}
              onChange={(e) => setForwardUrl(e.target.value)}
              className="flex-1 bg-[#020617] border border-white/5 rounded-lg px-4 py-2.5 text-sm font-sans text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder:text-slate-600"
            />
            <button 
              onClick={handleSaveForwardUrl}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-sm font-sans font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2 shrink-0"
            >
              <Save className="w-4 h-4" /> Save Destination
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            
            // Check if active from endpoint config
            const savedConfig = (endpoint?.integrations || []).find(i => i.provider === integration.id);
            const isConnected = savedConfig?.isActive;

            return (
              <div 
                key={integration.id} 
                className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm flex flex-col justify-between group hover:border-white/10 transition-colors relative overflow-hidden"
              >
                {/* Configuration Overlay */}
                {activeConfigId === integration.id && (
                  <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md z-10 flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-sans font-semibold text-white flex items-center gap-2">
                        <Icon className="w-5 h-5" /> Configure {integration.name}
                      </h3>
                      <button onClick={() => setActiveConfigId(null)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-sans font-medium text-slate-400 mb-2">
                        {integration.name} Webhook Secret
                      </label>
                      <input
                        type="text"
                        placeholder="whsec_..."
                        value={integrationSecret}
                        onChange={(e) => setIntegrationSecret(e.target.value)}
                        className="w-full bg-[#020617] border border-white/5 rounded-lg px-4 py-2.5 text-sm font-sans text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        We use this secret to cryptographically verify signatures (e.g. HMAC-SHA256) on incoming webhooks to ensure they are genuinely from {integration.name}.
                      </p>
                    </div>
                    
                    <button 
                      onClick={handleSaveIntegration}
                      disabled={!integrationSecret}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#020617] text-sm font-sans font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Verify & Save
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-5 mb-8">
                  <div className={`p-4 rounded-xl border border-white/5 ${integration.bg} shrink-0`}>
                    <Icon className={`w-8 h-8 ${integration.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-sans font-semibold text-white">{integration.name}</h3>
                      {isConnected && (
                        <span className="flex items-center gap-1.5 text-xs font-sans font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-sans text-slate-400 leading-relaxed">
                      {integration.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-end mt-auto">
                  {isConnected ? (
                    <button 
                      onClick={() => handleDisableIntegration(integration.id)}
                      className="text-sm font-sans font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 rounded-lg transition-colors border border-red-500/20"
                    >
                      Disable Integration
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setActiveConfigId(integration.id); setIntegrationSecret(''); }}
                      className="text-sm font-sans font-medium text-[#020617] bg-white hover:bg-slate-200 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      Configure <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
