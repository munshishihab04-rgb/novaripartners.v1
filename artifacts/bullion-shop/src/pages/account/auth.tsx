import { useState } from "react";
import { useLocation } from "wouter";
import { setUserToken, setStoredUser } from "@/lib/user-auth";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export default function AccountAuth() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMode, setResetMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get("token");
  });
  const [resetToken] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    if (resetNewPassword !== resetConfirm) { setError("Passwords do not match"); setLoading(false); return; }
    if (resetNewPassword.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword: resetNewPassword }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Reset failed"); return; }
      setResetDone(true);
    } catch { setError("Network error"); } finally { setLoading(false); }
  };
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail }) });
      setForgotSent(true);
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "", phone: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      setUserToken(data.token);
      setStoredUser(data.user);
      window.dispatchEvent(new Event("user-auth-changed"));
      setLocation("/account");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    if (regForm.password !== regForm.confirmPassword) { setError("Passwords do not match"); return; }
    if (regForm.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regForm.email, password: regForm.password, firstName: regForm.firstName, lastName: regForm.lastName, phone: regForm.phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      setUserToken(data.token);
      setStoredUser(data.user);
      window.dispatchEvent(new Event("user-auth-changed"));
      setLocation("/account");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-foreground font-bold">NovariPartners</h1>
            <p className="text-muted-foreground mt-1 text-sm">Premium Silver Bullion</p>
          </div>

          {resetMode && (
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden p-6">
              {resetDone ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-green-600 text-xl">✓</span></div>
                  <p className="font-semibold text-foreground">Password updated!</p>
                  <p className="text-sm text-muted-foreground mt-1">You can now sign in with your new password.</p>
                  <button onClick={() => { setResetMode(false); setTab("login"); window.history.replaceState({}, "", "/account/auth"); }} className="mt-4 text-primary text-sm font-medium hover:underline">Sign In</button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <h3 className="font-semibold text-foreground">Set New Password</h3>
                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} required placeholder="New password (min. 8)" value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)}
                      className="w-full h-11 px-3 pr-10 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <input type="password" required placeholder="Confirm new password" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)}
                    className="w-full h-11 px-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Set New Password
                  </Button>
                </form>
              )}
            </div>
          )}
          {!resetMode && <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-border">
              {(["login", "register"] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  className={`py-3.5 text-sm font-semibold transition-colors ${tab === t ? "bg-background text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {forgotMode ? (
                forgotSent ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-green-600 text-xl">✓</span></div>
                    <p className="font-semibold text-foreground">Check your inbox</p>
                    <p className="text-sm text-muted-foreground mt-1">We sent a reset link to <strong>{forgotEmail}</strong></p>
                    <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="mt-4 text-primary text-sm font-medium hover:underline">Back to Sign In</button>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                        className="w-full h-11 px-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        placeholder="you@example.com" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">Send Reset Link</Button>
                    <button type="button" onClick={() => setForgotMode(false)} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">Back to Sign In</button>
                  </form>
                )
              ) : tab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input type="email" required value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full h-11 px-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} required value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                        className="w-full h-11 px-3 pr-10 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Sign In
                  </Button>
                  <button type="button" onClick={() => setForgotMode(true)} className="w-full text-xs text-muted-foreground hover:text-primary text-center">
                    Forgot your password?
                  </button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-primary font-medium hover:underline">Create one</button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                      <input type="text" value={regForm.firstName} onChange={e => setRegForm(p => ({ ...p, firstName: e.target.value }))}
                        className="w-full h-11 px-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                      <input type="text" value={regForm.lastName} onChange={e => setRegForm(p => ({ ...p, lastName: e.target.value }))}
                        className="w-full h-11 px-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input type="email" required value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full h-11 px-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
                    <input type="tel" value={regForm.phone} onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full h-11 px-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} required value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                        className="w-full h-11 px-3 pr-10 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        placeholder="Min. 8 characters" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                    <input type="password" required value={regForm.confirmPassword} onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full h-11 px-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      placeholder="••••••••" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Account
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-primary font-medium hover:underline">Sign in</button>
                  </p>
                </form>
              )}
            </div>
          </div>
          }

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span>Your data is encrypted and secure</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
