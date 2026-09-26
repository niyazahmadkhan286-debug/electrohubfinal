'use client';

import React, { useState } from 'react';

// ==========================================
// 1. ORDER & REVENUE TREND CHART (AREA / LINE)
// ==========================================
interface TrendDataPoint {
  label: string;
  value: number;
  orders: number;
}

interface OrderTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
}

export const OrderTrendChart: React.FC<OrderTrendChartProps> = ({
  data,
  title = 'Order Trends & Revenue ($)',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/40">
        <p className="text-sm font-medium">No order trends data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 100);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.value / maxValue) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${
    chartHeight - paddingY
  } Z`;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
          <p className="text-xs text-slate-400">Total volume and revenue across chronological cycles</p>
        </div>
        {hoveredIdx !== null && (
          <div className="text-xs bg-slate-800 px-3 py-1 rounded-md border border-slate-700 text-slate-200">
            <span className="font-semibold text-blue-400">{data[hoveredIdx].label}:</span> $
            {data[hoveredIdx].value.toLocaleString()} ({data[hoveredIdx].orders} orders)
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="#334155"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={chartHeight / 2}
            x2={chartWidth - paddingX}
            y2={chartHeight / 2}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />

          {/* Fill Area */}
          <path d={areaD} fill="url(#blueGradient)" />

          {/* Stroke Line */}
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />

          {/* Dots */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? 6 : 4}
                className={`transition-all duration-150 cursor-pointer ${
                  hoveredIdx === i ? 'fill-blue-400 stroke-white stroke-2' : 'fill-blue-600 stroke-slate-900 stroke-2'
                }`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between px-6 pt-2 text-[11px] font-medium text-slate-400">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PRODUCT CATEGORIES BAR CHART
// ==========================================
interface CategoryCount {
  category: string;
  count: number;
}

export const CategoryBarChart: React.FC<{ data: CategoryCount[]; title?: string }> = ({
  data,
  title = 'Product Category Distribution',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/40">
        <p className="text-sm font-medium">No category distribution data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-slate-400">Active catalog items grouped by hardware family</p>
      </div>

      <div className="space-y-3">
        {data.slice(0, 6).map((cat, i) => {
          const percentage = Math.round((cat.count / maxCount) * 100);
          const colors = [
            'bg-blue-500',
            'bg-indigo-500',
            'bg-cyan-500',
            'bg-emerald-500',
            'bg-purple-500',
            'bg-amber-500',
          ];
          const color = colors[i % colors.length];

          return (
            <div key={cat.category} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300 truncate max-w-[220px]">{cat.category}</span>
                <span className="text-slate-400 font-semibold">{cat.count} items</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. STOCK STATUS DONUT / BREAKDOWN
// ==========================================
interface StockStatusProps {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  title?: string;
}

export const StockStatusChart: React.FC<StockStatusProps> = ({
  inStock,
  lowStock,
  outOfStock,
  title = 'Inventory Health & Stock Status',
}) => {
  const total = inStock + lowStock + outOfStock;

  if (total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/40">
        <p className="text-sm font-medium">No stock records in database</p>
      </div>
    );
  }

  const inStockPct = Math.round((inStock / total) * 100);
  const lowStockPct = Math.round((lowStock / total) * 100);
  const outOfStockPct = Math.round((outOfStock / total) * 100);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-slate-400">Real-time inventory operational readiness breakdown</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
        {/* Visual Progress Arc / Indicator */}
        <div className="relative flex items-center justify-center w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.8"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* IN STOCK */}
            <path
              className="text-emerald-500 transition-all duration-700"
              strokeDasharray={`${inStockPct}, 100`}
              strokeWidth="3.8"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{inStockPct}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Available</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-slate-300">In Stock</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">{inStock}</span>
              <span className="text-[11px] text-slate-400 ml-1.5">({inStockPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-slate-300">Low Stock Alert</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">{lowStock}</span>
              <span className="text-[11px] text-slate-400 ml-1.5">({lowStockPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-xs font-medium text-slate-300">Out of Stock</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">{outOfStock}</span>
              <span className="text-[11px] text-slate-400 ml-1.5">({outOfStockPct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
