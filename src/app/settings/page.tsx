'use client';

import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Database,
  Bell,
  User,
  Shield,
  RefreshCw,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    setSupabaseCredentials,
    isSupabaseActive,
    isSyncing,
    syncWithSupabase,
    resetToDemoData,
    clearDatabase,
    products,
    customers,
    orders,
    fullTimeEmployees,
    partTimeEmployees,
    contractors,
    discontinuedProducts,
  } = useElectroHub();

  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabase?.url || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabase?.anonKey || '');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Appearance handlers
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    showToast.success('Theme Changed', `Interface appearance set to ${theme}.`);
  };

  const handleCompactToggle = () => {
    const next = !settings.compactMode;
    updateSettings({ compactMode: next });
    showToast.info('Display Preference', `Compact view mode ${next ? 'enabled' : 'disabled'}.`);
  };

  // Notification handlers
  const handleToggleNotif = (key: 'lowStockAlerts' | 'orderNotifications' | 'emailAlerts') => {
    const next = !settings.notifications[key];
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: next,
      },
    });
    showToast.info('Notification Updated', `Preference saved.`);
  };

  // Supabase connection handler
  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingConnection(true);

    try {
      const isConfigured = await setSupabaseCredentials(supabaseUrl.trim(), supabaseKey.trim());
      if (isConfigured) {
        showToast.success('Supabase Connected', 'Successfully initialized Supabase PostgreSQL connection!');
      } else {
        showToast.warning(
          'Saved Credentials',
          'Credentials saved. Check your URL format (https://your-ref.supabase.co).'
        );
      }
    } catch (err: any) {
      showToast.error('Connection Error', err.message || 'Failed to connect to Supabase.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Backup Export
  const handleExportJSON = () => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      products,
      customers,
      orders,
      fullTimeEmployees,
      partTimeEmployees,
      contractors,
      discontinuedProducts,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electrohub_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast.success('Backup Generated', 'Full database snapshot exported as JSON.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Settings & Database</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure UI appearance, real-time alert thresholds, Supabase credentials, and data backups.
          </p>
        </div>

        {/* 1. APPEARANCE SETTINGS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sun className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Appearance & Theme</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-3">Color Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400" />
                <div className="text-left">
                  <p className="text-xs font-bold">Dark Tech Mode</p>
                  <p className="text-[10px] text-slate-500">Default high-contrast SaaS</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  settings.theme === 'light'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <p className="text-xs font-bold">Light Office Mode</p>
                  <p className="text-[10px] text-slate-500">Clean daytime brightness</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  settings.theme === 'system'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <p className="text-xs font-bold">System Preference</p>
                  <p className="text-[10px] text-slate-500">Match operating system</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-850">
            <div>
              <p className="text-xs font-semibold text-white">Compact Data Density</p>
              <p className="text-[11px] text-slate-400">Reduce table paddings for high-density inventory monitors</p>
            </div>
            <button
              onClick={handleCompactToggle}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.compactMode ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.compactMode ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. NOTIFICATIONS SETTINGS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Alert & Notification Rules</h3>
          </div>

          <div className="divide-y divide-slate-850">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Low Stock Threshold Warnings</p>
                <p className="text-[11px] text-slate-400">
                  Trigger notifications when components drop below specified safety buffers
                </p>
              </div>
              <button
                onClick={() => handleToggleNotif('lowStockAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.notifications.lowStockAlerts ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.notifications.lowStockAlerts ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Purchase Order Fulfillment Alerts</p>
                <p className="text-[11px] text-slate-400">
                  Broadcast notification whenever a client purchase order is created
                </p>
              </div>
              <button
                onClick={() => handleToggleNotif('orderNotifications')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.notifications.orderNotifications ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.notifications.orderNotifications ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Digest Email Notifications</p>
                <p className="text-[11px] text-slate-400">
                  Send daily summary of stock intakes and inventory adjustments to registered email
                </p>
              </div>
              <button
                onClick={() => handleToggleNotif('emailAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.notifications.emailAlerts ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.notifications.emailAlerts ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 3. SUPABASE POSTGRESQL CONFIGURATION */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Supabase PostgreSQL Connection
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold"
              style={{
                backgroundColor: isSupabaseActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                borderColor: isSupabaseActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                color: isSupabaseActive ? '#34d399' : '#60a5fa',
              }}
            >
              {isSupabaseActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Live Supabase Connected</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready for Supabase URL</span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            ElectroHub communicates directly with Supabase via `@supabase/supabase-js`. You can enter your project URL and public Anon key below, or set them in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
          </p>

          <form onSubmit={handleSaveSupabase} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500">
                SQL schema is available at root: <code className="text-blue-400 font-mono">supabase_schema.sql</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={syncWithSupabase}
                  disabled={!isSupabaseActive || isSyncing}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync from Supabase</span>
                </button>
                <button
                  type="submit"
                  disabled={isTestingConnection}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isTestingConnection ? 'Verifying...' : 'Save & Connect Supabase'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 4. DATABASE RESET & EVALUATION TOOLS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Data Management & Viva Demonstration Tools
            </h3>
          </div>

          <p className="text-xs text-slate-300">
            Use these controls to test empty database states, reload the rich electronics demo dataset, or export full backups.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => {
                resetToDemoData();
                showToast.success('Demo Data Restored', 'Full electronics catalog, orders, and workforce reloaded.');
              }}
              className="p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Reload Demo Dataset</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export Full JSON Backup</span>
            </button>

            <button
              onClick={() => {
                clearDatabase();
                showToast.warning('Database Emptied', 'All items cleared to verify zero-state handling.');
              }}
              className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Clear Database (Empty Test)</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
