'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Boxes,
  Users,
  ShoppingBag,
  Award,
  Calendar,
  Layers,
  PieChart,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OrderTrendChart, CategoryBarChart, StockStatusChart } from '@/components/charts/Charts';
import { useElectroHub } from '@/lib/store';
import { ProductCategory } from '@/types';

const CATEGORIES: ProductCategory[] = [
  'Microcontrollers & ICs',
  'Sensors & Modules',
  'Displays & Optoelectronics',
  'Power & Batteries',
  'Wireless & IoT',
  'Computer Hardware & GPUs',
  'Audio & Peripherals',
  'Robotics & Motors',
  'Test & Measurement',
  'Tools & Soldering',
];

export default function AnalyticsPage() {
  const { products, orders, customers } = useElectroHub();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Key performance computations
  const totalGrossRevenue = orders.reduce((sum, o) => sum + o.order_total, 0);
  const avgOrderValue = orders.length > 0 ? totalGrossRevenue / orders.length : 0;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock_quantity, 0);
  const totalInventoryAssetValue = products.reduce((sum, p) => sum + p.stock_quantity * p.price, 0);

  const inStockCount = products.filter((p) => p.status === 'IN STOCK').length;
  const lowStockCount = products.filter((p) => p.status === 'LOW STOCK').length;
  const outOfStockCount = products.filter((p) => p.status === 'OUT OF STOCK').length;

  // Chart data
  const orderTrends = orders.map((o) => ({
    label: o.order_id,
    value: o.order_total,
    orders: o.items ? o.items.length : 1,
  }));

  const categoryDistribution = CATEGORIES.map((c) => ({
    category: c,
    count: products.filter((p) => p.category === c).length,
  })).filter((c) => c.count > 0);

  // Top Spending Customers
  const topCustomers = [...customers]
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Business Intelligence & Analytics</h2>
            <p className="text-xs text-slate-400 mt-1">
              Deep telemetry across electronics inventory turnover, purchase volume, and customer valuation.
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {(['7d', '30d', '90d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                  timeframe === t
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Analytics Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="uppercase tracking-wider">Gross Order Value</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">
              ${totalGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">From {orders.length} executed transactions</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="uppercase tracking-wider">Average Order Value (AOV)</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              ${avgOrderValue.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Per client transaction</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="uppercase tracking-wider">Total Inventory Assets</span>
              <Boxes className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              ${totalInventoryAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{totalStockUnits.toLocaleString()} total units on shelf</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="uppercase tracking-wider">Order Conversion Ratio</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400 mt-2">
              {customers.length > 0 ? (orders.length / customers.length).toFixed(1) : '0'}x
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Orders per registered customer</p>
          </div>
        </div>

        {/* Charts Row 1: Order Trends + Stock Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrderTrendChart
              data={
                orderTrends.length > 0
                  ? orderTrends
                  : [{ label: 'Baseline', value: 0, orders: 0 }]
              }
              title="Procurement Volume & Revenue Curve ($)"
            />
          </div>

          <div>
            <StockStatusChart
              inStock={inStockCount}
              lowStock={lowStockCount}
              outOfStock={outOfStockCount}
              title="Stock Health Index"
            />
          </div>
        </div>

        {/* Charts Row 2: Category Breakdown + Top Customer Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBarChart
            data={categoryDistribution}
            title="Component Family Market Distribution"
          />

          {/* Top Customer Accounts Leaderboard */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">Top Client Accounts by Spend</h4>
                  <p className="text-xs text-slate-400">High-value enterprise laboratories and clients</p>
                </div>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="space-y-3 pt-1">
                {topCustomers.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No customer accounts available.</p>
                ) : (
                  topCustomers.map((c, i) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                          0{i + 1}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {c.first_name} {c.last_name}
                          </p>
                          <p className="text-[10px] text-slate-400">{c.company || c.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-400 font-mono">
                          ${c.total_spent.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-500">{c.orders_count} orders</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Updated automatically with every fulfilled purchase order.</span>
              <span className="text-emerald-400 font-medium">&bull; Verified</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
