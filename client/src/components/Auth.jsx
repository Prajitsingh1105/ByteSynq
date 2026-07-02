import { API_URL } from '../config.js';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Code2, ArrowRight, Loader2, ShieldCheck, Mail, Lock, GitBranch, 
  Terminal, Zap, Activity, Globe, LockKeyhole, Box, Hexagon, Triangle, 
  Command, Server, CheckCircle2, ChevronRight, Eye, EyeOff, KeyRound
} from 'lucide-react';
import ByteSynqLogo from './ByteSynqLogo';
import Documentation from './Documentation';
import Features from './Features';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'docs', 'features'
  const [otpStep, setOtpStep] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otp, setOtp] = useState('');

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, text: '', color: 'bg-slate-700' };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Good', color: 'bg-amber-500' };
    return { score, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  useEffect(() => {
    setOtpStep(false);
    setOtp('');
    setIsForgotPassword(false);
  }, [isLogin]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const oauthError = params.get('error');
    
    if (token) {
      localStorage.setItem('token', token);
      axios.get(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        window.history.replaceState({}, document.title, window.location.pathname);
        onLoginSuccess({ ...res.data.user, token });
        toast.success("Successfully authenticated!");
      }).catch(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        localStorage.removeItem('token');
        setError('Failed to fetch user data after OAuth');
        toast.error("Failed to authenticate with provider. Please try again.");
      });
    }
    if (oauthError) {
      setError('OAuth authentication failed');
      toast.error("OAuth authentication failed");
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isForgotPassword && !otpStep) {
        // Step 1 of Password Reset: Request OTP
        const res = await axios.post(`${API_URL}/api/v1/auth/send-otp`, { email, isReset: true });
        if (res.data.success) {
          setOtpStep(true);
          toast.success("Verification code sent to your email");
        }
      } else if (isForgotPassword && otpStep) {
        // Step 2 of Password Reset
        if (strength.score < 5) {
          const msg = 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.';
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }
        const res = await axios.post(`${API_URL}/api/v1/auth/reset-password`, { email, password, otp });
        if (res.data.success) {
          onLoginSuccess(res.data.user);
          toast.success("Password reset successfully! You are now logged in.");
        }
      } else if (!isLogin && !otpStep) {
        if (strength.score < 5) {
          const msg = 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.';
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }
        // Step 1 of Signup: Request OTP
        const res = await axios.post(`${API_URL}/api/v1/auth/send-otp`, { email });
        if (res.data.success) {
          setOtpStep(true);
          toast.success("Verification code sent to your email");
        }
      } else {
        // Step 2 of Signup (or regular login)
        const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
        const payload = isLogin ? { email, password } : { email, password, otp };
        const res = await axios.post(`${API_URL}${endpoint}`, payload);
        
        if (res.data.success) {
          onLoginSuccess(res.data.user);
          toast.success(isLogin ? "Logged in successfully!" : "Account created successfully!");
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'An error occurred';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const scrollToAuth = () => {
    document.getElementById('auth-portal')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] opacity-30" />
      </div>

      {/* Global Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <ByteSynqLogo className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ByteSynq</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => setCurrentView('features')} className={`transition-colors ${currentView === 'features' ? 'text-white' : 'hover:text-white'}`}>Features</button>
            <button onClick={() => setCurrentView('docs')} className={`transition-colors ${currentView === 'docs' ? 'text-white' : 'hover:text-white'}`}>Documentation</button>
            <button onClick={() => setCurrentView('landing')} className="hover:text-white transition-colors">Pricing</button>
            <button className="hover:text-white transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Status
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setCurrentView('landing'); setIsLogin(true); setTimeout(scrollToAuth, 100); }}
              className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => { setCurrentView('landing'); setIsLogin(false); setTimeout(scrollToAuth, 100); }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {currentView === 'docs' ? (
        <div className="pt-16 h-screen w-full overflow-hidden">
          <Documentation />
        </div>
      ) : currentView === 'features' ? (
        <div className="pt-16 h-screen w-full overflow-hidden">
          <Features />
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 min-h-[90vh]">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5 text-sm font-medium text-emerald-400 mb-6">
            <Zap className="w-4 h-4" /> v2.0 Now Available
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            The professional way to <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              debug webhooks.
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Create secure endpoints, instantly inspect live payloads, and forward webhooks to your own backend with enterprise-grade reliability and zero-logging architecture.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button 
              onClick={() => { setIsLogin(false); scrollToAuth(); }}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-base font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              Start Catching Webhooks <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentView('docs')}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/50 hover:bg-slate-800 text-white text-base font-medium rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              View Documentation
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative perspective-1000">
          <div className="relative transform lg:rotate-y-[-10deg] lg:rotate-x-[5deg] transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0">
            {/* Main Glass Panel */}
            <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs font-mono text-slate-500">POST /api/webhooks/req_abc123</div>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-2 rounded">
                  <CheckCircle2 className="w-4 h-4" /> 200 OK — 1.2ms
                </div>
                <div className="bg-[#020617]/50 rounded-lg p-4 border border-white/5">
                  <div className="text-slate-400 mb-2">Headers</div>
                  <div className="text-slate-300">
                    <span className="text-cyan-400">content-type:</span> application/json<br/>
                    <span className="text-cyan-400">x-stripe-signature:</span> t=1628...
                  </div>
                </div>
                <div className="bg-[#020617]/50 rounded-lg p-4 border border-white/5 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
                  <div className="text-slate-400 mb-2">Payload</div>
                  <pre className="text-emerald-300 text-xs overflow-x-auto">
{`{
  "id": "evt_12345",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="hidden lg:block absolute -right-12 top-1/4 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Signature Validated</div>
                  <div className="text-sm font-bold text-white">HMAC SHA-256</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-white/5 bg-[#0f172a]/30 backdrop-blur-sm py-10 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-8">
            Trusted by engineering teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-xl font-bold"><Hexagon className="w-8 h-8"/> AcmeCorp</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Triangle className="w-8 h-8"/> Vercity</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Command className="w-8 h-8"/> SysOps</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Box className="w-8 h-8"/> Dataplane</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Server className="w-8 h-8"/> NetScale</div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Enterprise architecture, <br className="hidden sm:block"/>built for individuals.</h2>
          <p className="text-slate-400">Everything you need to catch, inspect, and route webhooks safely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <LockKeyhole className="w-32 h-32 text-emerald-400" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">End-to-End Encryption</h3>
            <p className="text-slate-400 leading-relaxed max-w-sm relative z-10">
              Webhooks are encrypted in transit and at rest. Native HMAC verification for Stripe, GitHub, and Shopify stops malicious requests before they hit your database.
            </p>
          </div>

          <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-Time Data Streaming</h3>
            <p className="text-slate-400 leading-relaxed max-w-sm relative z-10">
              Powered by Redis and Socket.io. See webhooks appear in your dashboard the exact millisecond they are fired, with zero polling required.
            </p>
          </div>

          <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-6 relative z-10">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Multi-Tenant Workspaces</h3>
            <p className="text-slate-400 leading-relaxed max-w-sm relative z-10">
              Create distinct, isolated endpoints for different projects or environments (Staging vs. Prod). Route traffic precisely where it belongs.
            </p>
          </div>

          <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute right-0 bottom-0 opacity-10 p-8 transform rotate-12 group-hover:rotate-0 transition-transform">
              <Terminal className="w-24 h-24 text-blue-400" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 relative z-10">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Zero Logging Configuration</h3>
            <p className="text-slate-400 leading-relaxed max-w-sm relative z-10">
              Strict compliance requirements? Configure endpoints to act as pure proxies, forwarding payloads directly to your infrastructure without writing to disk.
            </p>
          </div>

        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 relative z-10 bg-[#0f172a]/30 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="flex-1 w-full space-y-6">
              <h2 className="text-3xl font-bold text-white">From Terminal to UI in milliseconds.</h2>
              <p className="text-slate-400 text-lg">Send webhooks from any system, anywhere. ByteSynq catches them, parses them, and makes them readable instantly.</p>
              
              <div className="bg-[#020617] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-2 bg-slate-900 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="mx-auto text-xs text-slate-500 font-mono">bash</div>
                </div>
                <div className="p-4 font-mono text-sm overflow-x-auto text-slate-300">
                  <span className="text-emerald-400">$</span> curl -X POST https://api.bytesynq.io/v1/req_abc123 \ <br/>
                  &nbsp;&nbsp;-H <span className="text-amber-300">"Content-Type: application/json"</span> \ <br/>
                  &nbsp;&nbsp;-d <span className="text-amber-300">'{"{"}"event": "user.signup", "userId": 42{"}"}'</span><br/>
                  <br/>
                  <span className="text-slate-500"># {"{"}"message": "Webhook intercepted successfully"{"}"}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="bg-[#020617] rounded-xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[50px]" />
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-white">Live Stream</span>
                    <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/> Listening</span>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="bg-slate-800/50 border border-emerald-500/30 p-4 rounded-lg flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">POST</span>
                        <span className="text-sm text-slate-300 font-mono">user.signup</span>
                      </div>
                      <span className="text-xs text-slate-500">Just now</span>
                    </div>
                    
                    <div className="bg-slate-800/30 border border-white/5 p-4 rounded-lg flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">POST</span>
                        <span className="text-sm text-slate-300 font-mono">invoice.paid</span>
                      </div>
                      <span className="text-xs text-slate-500">2m ago</span>
                    </div>
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Authentication Portal */}
      <section id="auth-portal" className="py-32 px-6 max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to catch?</h2>
          <p className="text-slate-400">Join thousands of developers debugging webhooks faster.</p>
        </div>

        <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {isForgotPassword ? 'Reset password' : isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {isForgotPassword ? 'Enter your email to receive a secure reset code.' : isLogin ? 'Enter your credentials to access your workspace.' : 'Start capturing webhooks in seconds.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!otpStep ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-[#020617] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                      {isLogin && (
                        <button 
                          type="button" 
                          onClick={() => { setIsForgotPassword(true); setError(null); }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-[#020617] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {!isLogin && password && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1.5 w-full mb-1">
                          <div className={`flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-700/50'}`}></div>
                          <div className={`flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-700/50'}`}></div>
                          <div className={`flex-1 rounded-full ${strength.score >= 5 ? strength.color : 'bg-slate-700/50'}`}></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                          <span>Strength: <span className={strength.text === 'Weak' ? 'text-red-400' : strength.text === 'Good' ? 'text-amber-400' : 'text-emerald-400'}>{strength.text}</span></span>
                          <span className={password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>{password.length}/8+ chars</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Verification Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      className="w-full bg-[#020617] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-center tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">We sent a verification code to {email}</p>
                </div>
                {isForgotPassword && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter a strong new password"
                        className="w-full bg-[#020617] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1.5 w-full mb-1">
                          <div className={`flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-700/50'}`}></div>
                          <div className={`flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-700/50'}`}></div>
                          <div className={`flex-1 rounded-full ${strength.score >= 5 ? strength.color : 'bg-slate-700/50'}`}></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                          <span>Strength: <span className={strength.text === 'Weak' ? 'text-red-400' : strength.text === 'Good' ? 'text-amber-400' : 'text-emerald-400'}>{strength.text}</span></span>
                          <span className={password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>{password.length}/8+ chars</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {!isLogin && !otpStep && !isForgotPassword ? 'Continue' : isLogin && !isForgotPassword ? 'Sign In' : isForgotPassword && !otpStep ? 'Send Reset Code' : isForgotPassword && otpStep ? 'Reset Password' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {!otpStep && !isForgotPassword && (
            <>
              <div className="mt-8 flex items-center justify-center">
                <div className="border-t border-slate-700 flex-grow"></div>
                <span className="mx-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">OR</span>
                <div className="border-t border-slate-700 flex-grow"></div>
              </div>
              
              <a 
                href={`${API_URL}/api/v1/auth/github`}
                className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-3 border border-slate-700"
              >
                <GitBranch className="w-5 h-5" />
                Continue with GitHub
              </a>
            </>
          )}

          <div className="mt-8 text-center text-sm text-slate-400">
            {otpStep ? (
              <button 
                type="button"
                onClick={() => setOtpStep(false)}
                className="text-emerald-400 font-medium hover:text-emerald-300 transition-all"
              >
                Back to {isForgotPassword ? 'Email Input' : 'Signup'}
              </button>
            ) : isForgotPassword ? (
              <button 
                type="button"
                onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(null); }}
                className="text-emerald-400 font-medium hover:text-emerald-300 transition-all"
              >
                Back to Login
              </button>
            ) : isLogin ? (
              <>Don't have an account? <button type="button" onClick={() => { setIsLogin(false); setError(null); }} className="text-emerald-400 font-medium hover:text-emerald-300 hover:underline transition-all">Sign up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setIsLogin(true); setError(null); }} className="text-emerald-400 font-medium hover:text-emerald-300 hover:underline transition-all">Log in</button></>
            )}
          </div>
        </div>
      </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#020617] relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">CLI Tool</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ByteSynqLogo className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-300">ByteSynq Labs</span>
            </div>
            
            <div className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} ByteSynq. All rights reserved.
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
