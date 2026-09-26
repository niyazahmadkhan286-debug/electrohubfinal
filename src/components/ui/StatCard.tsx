import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  contextText?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isWarning?: boolean;
  };
  accentColor?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  contextText,
  trend,
  accentColor = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: {
      border: 'hover:border-blue-500/40',
      bgGlow: 'group-hover:bg-blue-500/10',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      accentGlow: 'hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)]',
    },
    indigo: {
      border: 'hover:border-indigo-500/40',
      bgGlow: 'group-hover:bg-indigo-500/10',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      accentGlow: 'hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.25)]',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      bgGlow: 'group-hover:bg-emerald-500/10',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      accentGlow: 'hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      bgGlow: 'group-hover:bg-amber-500/10',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      accentGlow: 'hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      bgGlow: 'group-hover:bg-rose-500/10',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      accentGlow: 'hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)]',
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      bgGlow: 'group-hover:bg-cyan-500/10',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      accentGlow: 'hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)]',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      bgGlow: 'group-hover:bg-purple-500/10',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      accentGlow: 'hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)]',
    },
  };

  const scheme = colorMap[accentColor];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-slate-900/80 border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${
        scheme.border
      } ${scheme.accentGlow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold tracking-tight text-white">{value}</h4>
            {trend && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trend.isWarning
                    ? 'bg-rose-500/10 text-rose-400'
                    : trend.isPositive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${scheme.iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {contextText && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{contextText}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 text-[11px] font-medium">
            View &rarr;
          </span>
        </div>
      )}
    </div>
  );
};
