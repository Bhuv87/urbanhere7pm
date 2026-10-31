import React, { useState } from 'react';
import { useStore } from '../../store';
import { authService, isSupabaseConfigured, UserProfile } from '../../utils/supabase';

export const AuthPage: React.FC = () => {
  const { setCurrentUser, setStage, setToast } = useStore();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'engineer' | 'architect' | 'official' | 'citizen'>('engineer');
  const [organization, setOrganization] = useState('BBMP South Zone Civil Works');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    if (mode === 'forgot') {
      if (forgotStep === 'request') {
        if (!email.trim()) {
          setErrorMsg('Please enter your registered email address');
          setLoading(false);
          return;
        }
        const res = await authService.resetPasswordForEmail(email.trim());
        setInfoMsg(res.message);
        setForgotStep('reset');
        setLoading(false);
        return;
      } else {
        // Reset step
        if (newPassword.length < 6) {
          setErrorMsg('New password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMsg('Passwords do not match');
          setLoading(false);
          return;
        }

        const updateRes = await authService.setNewPassword(email.trim(), newPassword);
        if (updateRes.success && updateRes.user) {
          setCurrentUser(updateRes.user);
          setToast(`Password updated! Welcome back, ${updateRes.user.fullName}`);
          setStage('portal');
        } else {
          setErrorMsg(updateRes.error || 'Failed to update password');
        }
        setLoading(false);
        return;
      }
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name & title');
        setLoading(false);
        return;
      }

      const res = await authService.signUp(email, password, {
        fullName: fullName.trim(),
        role,
        organization: organization.trim(),
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        setCurrentUser(res.user);
        if (res.warning) {
          setToast(res.warning);
        } else {
          setToast(`Account created! Welcome ${res.user.fullName}`);
        }
        setStage('portal');
      }
    } else {
      // Sign In
      const res = await authService.signIn(email, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        setCurrentUser(res.user);
        if (res.warning) {
          setToast(res.warning);
        } else {
          setToast(`Welcome back, ${res.user.fullName}!`);
        }
        setStage('portal');
      }
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoRole: 'engineer' | 'official') => {
    setLoading(true);
    setErrorMsg(null);
    const demoEmail = demoRole === 'engineer' ? 'engineer.south@bbmp.gov.in' : 'joint.commissioner@bbmp.gov.in';
    const demoName = demoRole === 'engineer' ? 'K. S. Narayanaswamy' : 'Dr. R. Ramachandran';
    const demoOrg = demoRole === 'engineer' ? 'BBMP Major Roads & Infrastructure' : 'BBMP South Zone Commissioner Office';

    const res = await authService.signIn(demoEmail, 'demo123456');
    if (res.user) {
      const demoUser: UserProfile = {
        ...res.user,
        fullName: demoName,
        role: demoRole,
        organization: demoOrg,
      };
      setCurrentUser(demoUser);
      setToast(`Logged in as ${demoName} (${demoRole.toUpperCase()})`);
      setStage('portal');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-white font-mono flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-x-hidden">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl w-full mx-auto flex items-center justify-between pb-4 border-b border-white/15">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 bg-[#dc0000] inline-block" />
          <span className="font-bold text-sm uppercase tracking-wider text-white">
            BENGALURU DIGITAL TWIN // AUTHENTICATION GATEWAY
          </span>
        </div>
        <button
          onClick={() => setStage('landing')}
          className="text-xs font-bold text-slate-400 hover:text-white uppercase transition-none cursor-pointer flex items-center gap-1"
        >
          <span>⟵</span>
          <span>Back to Landing</span>
        </button>
      </header>

      {/* Auth Card Container */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-6 sm:py-8">
        <div className="bg-[#141822] border-2 border-black hard-shadow p-6 sm:p-8 space-y-4">
          {/* Supabase Status Banner */}
          <div className="flex items-center justify-between p-2.5 bg-black border border-white/20 text-[10px]">
            <span className="text-slate-400 font-bold uppercase">SUPABASE DATABASE:</span>
            {isSupabaseConfigured ? (
              <span className="text-[#00cc66] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#00cc66] rounded-full inline-block animate-pulse" />
                <span>CONNECTED (sxntjoriycultyrjuzhk)</span>
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />
                <span>LOCAL CACHE MODE</span>
              </span>
            )}
          </div>

          {/* Title & Mode Switcher */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              {mode === 'signin'
                ? 'OFFICIAL ACCESS SIGN IN'
                : mode === 'signup'
                ? 'REGISTER FIELD ACCOUNT'
                : 'RECOVER / RESET PASSWORD'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'forgot'
                ? 'Generate verified password reset token and update credentials.'
                : 'Authorized access to BBMP subsurface utility layouts & 3D digital twins.'}
            </p>
          </div>

          {/* 3-Way Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-black p-1 border border-white/20 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`py-2 text-center uppercase cursor-pointer transition-none ${
                mode === 'signin' ? 'bg-[#dc0000] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`py-2 text-center uppercase cursor-pointer transition-none ${
                mode === 'signup' ? 'bg-[#dc0000] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setForgotStep('request');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`py-2 text-center uppercase cursor-pointer transition-none ${
                mode === 'forgot' ? 'bg-amber-500 text-black font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Forgot Pwd
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Full Name &amp; Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhanush Rao"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black border border-white/30 p-2 text-white text-xs focus:outline-none focus:border-[#dc0000]"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Email Address:
              </label>
              <input
                type="email"
                required
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/30 p-2 text-white text-xs focus:outline-none focus:border-[#dc0000]"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase">
                    Password:
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setForgotStep('request');
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      className="text-[10px] text-amber-400 hover:underline uppercase cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-white/30 p-2 pr-16 text-white text-xs focus:outline-none focus:border-[#dc0000]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white px-1 uppercase font-bold cursor-pointer"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
            )}

            {/* FORGOT PASSWORD EXTRA FIELDS */}
            {mode === 'forgot' && forgotStep === 'reset' && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">
                    Enter New Password (min 6 chars):
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black border border-amber-400/50 p-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black border border-amber-400/50 p-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Role / Domain:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-black border border-white/30 p-2 text-white text-xs focus:outline-none"
                  >
                    <option value="engineer">Civil Engineer</option>
                    <option value="architect">Urban Architect</option>
                    <option value="official">BBMP / Utility Officer</option>
                    <option value="citizen">Citizen Surveyor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Organization:
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-black border border-white/30 p-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 bg-red-950/90 border border-red-500 text-red-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.toLowerCase().includes('rate limit') && (
                  <p className="text-[10px] text-red-300 leading-tight">
                    Supabase default free-tier SMTP limit reached. To skip confirmation emails, open your Supabase Dashboard: <strong>Authentication ➔ Providers ➔ Email ➔ toggle &quot;Confirm email&quot; OFF</strong>.
                  </p>
                )}
              </div>
            )}

            {/* Info Message */}
            {infoMsg && (
              <div className="p-2.5 bg-blue-950/90 border border-blue-500 text-blue-200 text-xs flex items-center gap-1.5">
                <span>ℹ️</span>
                <span>{infoMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white border border-black hard-shadow-sm py-3 font-bold uppercase tracking-wider cursor-pointer active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 mt-1 ${
                mode === 'forgot' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#dc0000] hover:bg-[#b00000]'
              }`}
            >
              {loading
                ? 'PROCESSING...'
                : mode === 'signin'
                ? 'SIGN IN TO TWIN →'
                : mode === 'signup'
                ? 'REGISTER IN SUPABASE & ENTER →'
                : forgotStep === 'request'
                ? 'VERIFY ACCOUNT & CONTINUE →'
                : 'SAVE NEW PASSWORD & ENTER →'}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white uppercase py-1 cursor-pointer"
              >
                ⟵ Return to Sign In
              </button>
            )}
          </form>

          {/* Quick Demo Bypass */}
          <div className="pt-3 border-t border-white/15 space-y-2">
            <div className="text-[10px] text-slate-400 uppercase font-bold text-center">
              INSTANT 1-CLICK DEMO ACCESS:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('engineer')}
                disabled={loading}
                className="bg-white text-black hover:bg-slate-200 border border-black py-2 text-[11px] font-bold uppercase cursor-pointer text-center"
              >
                ⚡ Civil Engineer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('official')}
                disabled={loading}
                className="bg-white/10 text-white hover:bg-white/20 border border-white/30 py-2 text-[11px] font-bold uppercase cursor-pointer text-center"
              >
                🏛️ BBMP Official
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl w-full mx-auto text-center text-xs text-slate-500 pt-4 border-t border-white/10">
        Bengaluru Digital Twin · Connected to Supabase Project: sxntjoriycultyrjuzhk
      </footer>
    </div>
  );
};
