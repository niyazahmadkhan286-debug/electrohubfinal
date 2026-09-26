'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export const showToast = {
  success: (title: string, description?: string) => {
    emitToast({ id: `t-${Date.now()}`, type: 'success', title, description });
  },
  error: (title: string, description?: string) => {
    emitToast({ id: `t-${Date.now()}`, type: 'error', title, description });
  },
  warning: (title: string, description?: string) => {
    emitToast({ id: `t-${Date.now()}`, type: 'warning', title, description });
  },
  info: (title: string, description?: string) => {
    emitToast({ id: `t-${Date.now()}`, type: 'info', title, description });
  },
};

const emitToast = (toast: ToastMessage) => {
  toastListeners.forEach((listener) => listener(toast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    toastListeners.push(handleToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const config = {
          success: {
            icon: CheckCircle2,
            bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200',
            iconColor: 'text-emerald-400',
          },
          error: {
            icon: AlertCircle,
            bg: 'bg-rose-950/90 border-rose-500/30 text-rose-200',
            iconColor: 'text-rose-400',
          },
          warning: {
            icon: AlertTriangle,
            bg: 'bg-amber-950/90 border-amber-500/30 text-amber-200',
            iconColor: 'text-amber-400',
          },
          info: {
            icon: Info,
            bg: 'bg-sky-950/90 border-sky-500/30 text-sky-200',
            iconColor: 'text-sky-400',
          },
        }[toast.type];

        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${config.bg}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-white">{toast.title}</p>
              {toast.description && <p className="text-xs text-slate-300 mt-0.5">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
