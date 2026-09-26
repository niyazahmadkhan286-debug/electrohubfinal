'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  User,
  Info,
} from 'lucide-react';
import { useElectroHub } from '@/lib/store';
import { showToast, ToastContainer } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const { login, signup, isSupabaseActive } = useElectroHub();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isSupabaseActive) {
      setErrorMessage(
        'Supabase is not yet connected. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (.env.local).'
      );
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUpMode) {
        const res = await signup(email, password, { first_name: firstName, last_name: lastName });
        if (res.success) {
          showToast.success('Account Created', 'Registration successful! You may now sign in or check your email.');
          setSuccessMessage('Registration successful! Please check your email if confirmation is required, or sign in.');
          setIsSignUpMode(false);
        } else {
          setErrorMessage(res.error || 'Registration failed.');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          showToast.success('Authentication Verified', 'Welcome back to ElectroHub.');
          router.push('/dashboard');
        } else {
          setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
        }
      }
    } catch (err: any) {
      setErrorMessage('Network or authorization error during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden tech-grid-pattern">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-extrabold tracking-tight text-white block">
              ELECTROHUB
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-400 block -mt-1">
              Electronics Management System
            </span>
          </div>
        </Link>
      </div>

      {/* Main Authentication Box */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isSignUpMode ? 'Register Account' : 'Portal Sign In'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSignUpMode ? 'Create new operator credentials' : 'Enter authorized Supabase credentials'}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${
              isSupabaseActive
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isSupabaseActive ? 'Supabase Auth' : 'Supabase Required'}</span>
          </div>
        </div>

        {/* Warning if Supabase is not configured */}
        {!isSupabaseActive && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Supabase Connection Required</p>
              <p className="text-amber-200/90 text-[11px] leading-relaxed">
                To sign in or create accounts, set <code className="text-white font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-white font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code className="text-white font-mono">.env.local</code> file.
              </p>
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification banner */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up extra fields */}
          {isSignUpMode && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-850 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sterling"
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-850 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@electrohub.io"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-850 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password input with show/hide */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">Password</label>
              {!isSignUpMode && (
                <button
                  type="button"
                  onClick={() =>
                    showToast.info('Password Reset', 'Please contact your Supabase administrator or check project auth.')
                  }
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-850 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button with loading state */}
          <button
            type="submit"
            disabled={isLoading || !isSupabaseActive}
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>{isSignUpMode ? 'Register with Supabase' : 'Sign In with Supabase'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In mode */}
        <div className="mt-5 pt-4 border-t border-slate-850 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUpMode(!isSignUpMode);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
          >
            {isSignUpMode
              ? 'Already have an account? Switch to Sign In'
              : 'Need a new operator account? Click to Register'}
          </button>
        </div>
      </div>

      {/* Footer text */}
      <div className="mt-8 text-center text-xs text-slate-500 relative z-10">
        <Link href="/" className="hover:text-slate-400 transition-colors">
          &larr; Return to ElectroHub Homepage
        </Link>
      </div>

      <ToastContainer />
    </div>
  );
}
