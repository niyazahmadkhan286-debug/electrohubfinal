'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Database,
  Bell,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    isSupabaseActive,
    isLoadingData,
    refreshData,
    products,
    customers,
    orders,
    fullTimeEmployees,
    partTimeEmployees,
    contractors,
    discontinuedProducts,
  } = useElectroHub();

  const [isTesting, setIsTesting] = useState(false);

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
    showToast.info('Notification Updated', 'Preference saved.');
  };

  // Supabase test and sync
  const handleTestAndSync = async () => {
    if (!isSupabaseActive) {
      showToast.error(
        'Supabase Not Configured',
        'Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
      );
      return;
    }

    setIsTesting(true);
    try {
      await refreshData();
      showToast.success('Connection Verified', 'Successfully queried Supabase PostgreSQL database.');
    } catch (err: any) {
      showToast.error('Sync Error', err.message || 'Failed to query Supabase.');
    } finally {
      setIsTesting(false);
    }
  };

  // Backup Export
  const handleExportJSON = () => {
    const backup = {
      version: '2.0',
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
    a.download = `electrohub_database_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast.success('Backup Exported', 'Full database snapshot exported as JSON.');
  };

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Settings & Database</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure UI appearance, notification alert policies, Supabase PostgreSQL sync, and database exports.
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

        {/* 3. SUPABASE POSTGRESQL ENVIRONMENT STATUS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Supabase PostgreSQL Environment
              </h3>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${
                isSupabaseActive
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              {isSupabaseActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected via Environment</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Awaiting Environment Variables</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">NEXT_PUBLIC_SUPABASE_URL</span>
                <span className="font-mono text-white">
                  {envUrl ? envUrl : '(Not set in .env.local)'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${envUrl ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {envUrl ? 'Configured' : 'Missing'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <span className="font-mono text-white">
                  {envKey ? `${envKey.substring(0, 16)}••••••••••••` : '(Not set in .env.local)'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${envKey ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {envKey ? 'Configured' : 'Missing'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <FileCode className="w-4 h-4" />
              <span>Production Setup Instructions</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1. Add your project URL and public Anon key to <code className="text-white font-mono">.env.local</code>:
            </p>
            <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto">
              NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co{'\n'}
              NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
            </pre>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              2. Apply <code className="text-white font-mono">supabase_schema.sql</code> in your Supabase SQL Editor.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={handleTestAndSync}
              disabled={isTesting || isLoadingData}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting || isLoadingData ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Verifying Supabase...' : 'Test Connection & Sync Tables'}</span>
            </button>
          </div>
        </div>

        {/* 4. DATA EXPORT */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Data Backup & Export
            </h3>
          </div>

          <p className="text-xs text-slate-300">
            Export a full JSON snapshot of all active products, customers, purchase orders, and workforce records.
          </p>

          <div className="pt-1">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export Full Database JSON Backup</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
