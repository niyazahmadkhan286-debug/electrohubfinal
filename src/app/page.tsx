'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Cpu,
  Boxes,
  ShoppingBag,
  Users,
  Briefcase,
  BarChart3,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
  Terminal,
  Database,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useElectroHub } from '@/lib/store';

export default function LandingPage() {
  const { products, orders, customers } = useElectroHub();

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.status === 'IN STOCK').length;
  const lowStockCount = products.filter((p) => p.status === 'LOW STOCK').length;
  const outOfStockCount = products.filter((p) => p.status === 'OUT OF STOCK').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. TOP PUBLIC NAVIGATION */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                ELECTROHUB
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400 block -mt-1">
                Electronics Management
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#inventory" className="hover:text-blue-400 transition-colors">Inventory Control</a>
            <a href="#analytics" className="hover:text-blue-400 transition-colors">Analytics</a>
            <a href="#technology" className="hover:text-blue-400 transition-colors">Technology</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden tech-grid-pattern">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-medium mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Electronics ERP & Hardware Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Smart Electronics <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Inventory & Management
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Manage your electronics business smarter, faster and from one place.
            End-to-end component tracking, automated reorder thresholds, customer sales workflows, and workforce governance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Explore Live Dashboard</span>
            </Link>
          </div>

          {/* HERO VISUAL: PREMIUM LIVE DASHBOARD PREVIEW */}
          <div className="relative mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur-xl tech-glow-blue text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs text-slate-400 ml-2 font-mono">electrohub.internal/control</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Telemetry Live
              </div>
            </div>

            {/* Preview Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-5">
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium uppercase">Catalog Stock</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totalProducts} Items</p>
                <p className="text-[10px] text-emerald-400 mt-1">&uarr; 100% active catalog</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium uppercase">In Stock Ready</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{inStockCount} Units</p>
                <p className="text-[10px] text-slate-400 mt-1">Ready for dispatch</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium uppercase">Low Stock Alerts</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{lowStockCount} Items</p>
                <p className="text-[10px] text-amber-400/80 mt-1">Reorder threshold hit</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium uppercase">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1">
                  ${orders.reduce((acc, o) => acc + o.order_total, 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{orders.length} fulfilled orders</p>
              </div>
            </div>

            {/* Preview Chart + Stock Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
              <div className="lg:col-span-2 p-4 rounded-xl bg-slate-850 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white">Sales & Electronics Order Throughput</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Real-time
                  </span>
                </div>
                {/* Visual Chart Wave */}
                <div className="h-28 flex items-end gap-2 pt-2">
                  {[45, 62, 55, 80, 70, 95, 88, 110, 100, 130, 125, 145].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm hover:opacity-90 transition-all"
                        style={{ height: `${(val / 150) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-1 uppercase font-mono">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>

              {/* Critical Alerts Preview */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2.5">
                <span className="text-xs font-semibold text-white block">Immediate Stock Attention</span>
                {products
                  .filter((p) => p.status !== 'IN STOCK')
                  .slice(0, 2)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200 truncate max-w-[140px]">{p.product_name}</p>
                        <p className="text-[10px] text-slate-500">{p.product_id}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          p.status === 'OUT OF STOCK'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {p.stock_quantity} left
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Comprehensive Architecture</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered Specifically for Electronics Operations
          </h3>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Every feature is purpose-built to prevent line stoppages, stockouts, and parts obsolescence across discrete electronic supply chains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Boxes className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Smart Inventory</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time multi-status stock classification (In Stock, Low Stock, Out of Stock) with dynamic reorder threshold triggering.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Product Management</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive catalog management for ICs, microcontrollers, sensors, display modules, power cells, and instrumentation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Order Tracking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated invoice calculation, multi-line product carts, and instant inventory stock deduction upon order confirmation.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Customer Management</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise customer profiles, lifetime purchase histories, total spend calculation, and account contacts.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Employee Management</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tiered organizational hierarchy dividing Full-Time staff, Part-Time lab technicians, and specialized hardware contractors.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Real-time Analytics</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live business intelligence charts showing stock distribution, category shares, revenue trends, and operational metrics.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS WORKFLOW */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Streamlined Flow</h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">How ElectroHub Automates Operations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative z-10">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                01
              </span>
              <h4 className="text-base font-bold text-white mb-2">Ingest & Categorize Inventory</h4>
              <p className="text-xs text-slate-400">
                Register component SKUs with unit prices, safety stock minimums, and datasheets. Connect directly to Supabase PostgreSQL.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative z-10">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                02
              </span>
              <h4 className="text-base font-bold text-white mb-2">Fulfill Customer Purchase Orders</h4>
              <p className="text-xs text-slate-400">
                Create multi-item orders. ElectroHub instantly deducts stock quantities, raises low-stock alerts, and logs customer sales history.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative z-10">
              <span className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                03
              </span>
              <h4 className="text-base font-bold text-white mb-2">Monitor Lifecycle & Workforce</h4>
              <p className="text-xs text-slate-400">
                Retire obsolete parts to the Discontinued Registry while assigning engineering shifts to full-time, part-time, and contractor teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INVENTORY & ORDER DEEP DIVE */}
      <section id="inventory" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Zero Stockout Guarantee</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-4">
              Real-Time Stock Alerts and Obsolescence Tracking
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              When working with high-lead-time electronics like microcontrollers and power management ICs, unexpected stock depletion halts production lines.
              ElectroHub continuously checks current stock against minimum thresholds and triggers instant notifications before zero-inventory occurs.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Automatic status recalculation: IN STOCK &rarr; LOW STOCK &rarr; OUT OF STOCK
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Dedicated Discontinued Products registry with transition audit trails
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Quick-increment stock receiving actions right from inventory rows
              </li>
            </ul>

            <div className="mt-8">
              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl transition-all"
              >
                <span>View Inventory Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl tech-glow-cyan">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-white">Live Stock Condition Breakdown</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Active
              </span>
            </div>
            <div className="space-y-3">
              {products.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{p.product_name}</p>
                    <p className="text-[11px] text-slate-400">{p.category} &bull; ${p.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        p.status === 'IN STOCK'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : p.status === 'LOW STOCK'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {p.status} ({p.stock_quantity})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. TECHNOLOGY STACK SECTION */}
      <section id="technology" className="py-16 bg-slate-900/40 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Modern Architecture</h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">Enterprise Production Tech Stack</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              ElectroHub is constructed on robust, battle-tested full-stack standards.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 mx-auto rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Next.js 16</p>
              <p className="text-[10px] text-slate-400">App Router & SSR</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 mx-auto rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
                <Terminal className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">TypeScript</p>
              <p className="text-[10px] text-slate-400">Strict Type Safety</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                <Database className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Supabase</p>
              <p className="text-[10px] text-slate-400">PostgreSQL Engine</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 mx-auto rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Supabase Auth</p>
              <p className="text-[10px] text-slate-400">Session Security</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 mx-auto rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Tailwind CSS</p>
              <p className="text-[10px] text-slate-400">Responsive Glass UI</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 mx-auto rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">RLS Policies</p>
              <p className="text-[10px] text-slate-400">Row Level Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl bg-gradient-to-b from-blue-900/30 to-slate-900 border border-blue-500/30 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full" />
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Upgrade Your Electronics Management?
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Experience complete control over products, automated orders, stock notifications, and workforce scheduling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
            >
              Explore Live Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">ELECTROHUB</span>
            <span>&mdash; Smart Electronics Inventory & Management System</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/help" className="hover:text-slate-300 transition-colors">Documentation</Link>
            <Link href="/settings" className="hover:text-slate-300 transition-colors">Supabase Setup</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
          </div>

          <div>&copy; {new Date().getFullYear()} ElectroHub Systems Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
