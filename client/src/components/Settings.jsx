import { useState, useEffect } from 'react';
import { Key, Clock, Eye, EyeOff, Save, Shield, FileJson, Reply, Bell } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Settings({ endpoint, onUpdateEndpoint }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [retention, setRetention] = useState(endpoint?.retentionDays || 7);
  const [validationSchema, setValidationSchema] = useState(endpoint?.validationSchema || '');
  const [mockResponse, setMockResponse] = useState(endpoint?.mockResponse || { statusCode: 200, body: '{"message": "Webhook intercepted!"}', headers: {} });
  const [alertSettings, setAlertSettings] = useState(endpoint?.alertSettings || { 
    webhookUrl: '', 
    triggerOn: 'forward_fail',
    emailAlerts: false,
    notifyOnForwardFail: true,
    notifyOnInactivity: false,
    inactivityThresholdHours: 24
  });

  // Sync state if endpoint prop changes
  useEffect(() => {
    if (endpoint) {
      setRetention(endpoint.retentionDays);
      setValidationSchema(endpoint.validationSchema || '');
      setMockResponse(endpoint.mockResponse || { statusCode: 200, body: '{"message": "Webhook intercepted!"}', headers: {} });
      setAlertSettings(endpoint.alertSettings || { 
        webhookUrl: '', 
        triggerOn: 'forward_fail',
        emailAlerts: false,
        notifyOnForwardFail: true,
        notifyOnInactivity: false,
        inactivityThresholdHours: 24
      });
    }
  }, [endpoint]);

  const apiKey = endpoint?.secretKey || 'No endpoint selected';

  const handleRotateKey = async () => {
    if (!endpoint) return;
    try {
      const res = await axios.post(`http://localhost:3001/api/v1/endpoints/${endpoint.endpointId}/rotate-secret`);
      if (res.data.success) {
        onUpdateEndpoint(res.data.endpoint);
        toast.success("API Key rotated successfully!");
      }
    } catch (err) {
      console.error("Failed to rotate key", err);
      toast.error("Failed to rotate API key");
    }
  };

  const handleSaveSettings = async () => {
    if (!endpoint) return;
    try {
      const res = await axios.patch(`http://localhost:3001/api/v1/endpoints/${endpoint.endpointId}/settings`, {
        retentionDays: Number(retention),
        forwardUrl: endpoint.forwardUrl,
        validationSchema: validationSchema,
        mockResponse: mockResponse,
        alertSettings: alertSettings
      });
      if (res.data.success) {
        onUpdateEndpoint(res.data.endpoint);
        toast.success("Settings saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save settings", err);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 no-scrollbar bg-[#020617]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-sans font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400 font-sans">Manage your workspace configuration and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* API Keys Section */}
          <section className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Key className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-sans font-semibold text-white">API Keys</h2>
            </div>
            
            <div className="max-w-2xl">
              <label className="block text-sm font-sans font-medium text-slate-400 mb-2">
                Primary Secret Key
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="w-full bg-[#020617] border border-white/5 rounded-lg pl-10 pr-12 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button onClick={handleRotateKey} className="px-4 py-2.5 bg-[#020617] hover:bg-[#0f172a] text-slate-300 text-sm font-sans font-medium rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                  Regenerate
                </button>
              </div>
              <p className="mt-3 text-xs font-sans text-slate-500">
                This key grants full access to the ByteSynq API. Keep it secure and do not share it.
              </p>
            </div>
          </section>

          {/* Data Retention Section */}
          <section className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-sans font-semibold text-white">Data Retention</h2>
            </div>
            
            <div className="max-w-2xl">
              <label className="block text-sm font-sans font-medium text-slate-400 mb-2">
                Log Retention Period
              </label>
              <div className="relative">
                <select
                  value={retention}
                  onChange={(e) => setRetention(e.target.value)}
                  className="w-full appearance-none bg-[#020617] border border-white/5 rounded-lg pl-4 pr-10 py-2.5 text-sm font-sans text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
                >
                  <option value="1">24 Hours</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-xs font-sans text-slate-500">
                Webhook payloads and logs older than the selected period will be permanently deleted.
              </p>
            </div>
          </section>

          {/* Schema Validation Section */}
          <section className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <FileJson className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-sans font-semibold text-white">Schema Validation</h2>
            </div>
            
            <div className="max-w-2xl">
              <label className="block text-sm font-sans font-medium text-slate-400 mb-2">
                JSON Schema (Ajv format)
              </label>
              <textarea
                value={validationSchema}
                onChange={(e) => setValidationSchema(e.target.value)}
                placeholder={'{\n  "type": "object",\n  "properties": { ... }\n}'}
                rows={8}
                className="w-full bg-[#020617] border border-white/5 rounded-lg p-4 text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
              <p className="mt-3 text-xs font-sans text-slate-500">
                Define a JSON schema to validate incoming webhooks. Payloads that fail validation will be marked with a 400 status. Leave blank to accept all payloads.
              </p>
            </div>
          </section>

          {/* Custom Mock Response Section */}
          <section className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Reply className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-sans font-semibold text-white">Custom Response</h2>
            </div>
            
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-slate-400 mb-2">
                  HTTP Status Code
                </label>
                <input
                  type="number"
                  value={mockResponse.statusCode}
                  onChange={(e) => setMockResponse({...mockResponse, statusCode: Number(e.target.value)})}
                  className="w-full bg-[#020617] border border-white/5 rounded-lg px-4 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-slate-400 mb-2">
                  Response Body (JSON)
                </label>
                <textarea
                  value={mockResponse.body}
                  onChange={(e) => setMockResponse({...mockResponse, body: e.target.value})}
                  rows={4}
                  className="w-full bg-[#020617] border border-white/5 rounded-lg p-4 text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </section>

          {/* Alerts & Notifications Section */}
          <section className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Bell className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-lg font-sans font-semibold text-white">Alerts & Notifications</h2>
            </div>
            
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-sans font-medium text-slate-400 mb-2">
                  Alert Webhook URL (Slack / Discord)
                </label>
                <input
                  type="text"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={alertSettings.webhookUrl}
                  onChange={(e) => setAlertSettings({...alertSettings, webhookUrl: e.target.value})}
                  className="w-full bg-[#020617] border border-white/5 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                />
                <p className="mt-2 text-xs font-sans text-slate-500">
                  We'll ping this URL if your Proxy Forwarding fails.
                </p>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-sans font-medium text-slate-300">Email Notifications</h3>
                    <p className="text-xs text-slate-500 mt-1">Receive alerts directly to your account email.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={alertSettings.emailAlerts || false}
                      onChange={(e) => setAlertSettings({...alertSettings, emailAlerts: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-[#020617] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 border border-white/5"></div>
                  </label>
                </div>

                {alertSettings.emailAlerts && (
                  <div className="pl-4 space-y-4 border-l-2 border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={alertSettings.notifyOnForwardFail ?? true}
                        onChange={(e) => setAlertSettings({...alertSettings, notifyOnForwardFail: e.target.checked})}
                        className="w-4 h-4 rounded border-white/10 bg-[#020617] text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-[#0f172a]"
                      />
                      <span className="text-sm text-slate-300">Alert me after 3 consecutive proxy forwarding failures</span>
                    </label>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={alertSettings.notifyOnInactivity || false}
                          onChange={(e) => setAlertSettings({...alertSettings, notifyOnInactivity: e.target.checked})}
                          className="w-4 h-4 rounded border-white/10 bg-[#020617] text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-[#0f172a]"
                        />
                        <span className="text-sm text-slate-300">Alert me if endpoint stops receiving webhooks</span>
                      </label>
                      
                      {alertSettings.notifyOnInactivity && (
                        <div className="flex items-center gap-3 ml-7">
                          <span className="text-xs text-slate-500">Inactivity Threshold:</span>
                          <select
                            value={alertSettings.inactivityThresholdHours || 24}
                            onChange={(e) => setAlertSettings({...alertSettings, inactivityThresholdHours: Number(e.target.value)})}
                            className="bg-[#020617] border border-white/5 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="1">1 Hour</option>
                            <option value="6">6 Hours</option>
                            <option value="12">12 Hours</option>
                            <option value="24">24 Hours</option>
                            <option value="48">48 Hours</option>
                            <option value="168">7 Days</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button onClick={handleSaveSettings} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-sm font-sans font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
