'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Cpu, Users, ShoppingBag, Briefcase, ArrowRight, X } from 'lucide-react';
import { useElectroHub } from '@/lib/store';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { products, customers, orders, allEmployees } = useElectroHub();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingProducts = trimmed
    ? products.filter(
        (p) =>
          p.product_name.toLowerCase().includes(trimmed) ||
          p.product_id.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingCustomers = trimmed
    ? customers.filter(
        (c) =>
          c.first_name.toLowerCase().includes(trimmed) ||
          c.last_name.toLowerCase().includes(trimmed) ||
          c.customer_id.toLowerCase().includes(trimmed) ||
          c.email.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingOrders = trimmed
    ? orders.filter(
        (o) =>
          o.order_id.toLowerCase().includes(trimmed) ||
          (o.customer_name && o.customer_name.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingEmployees = trimmed
    ? allEmployees.filter(
        (e) =>
          e.first_name.toLowerCase().includes(trimmed) ||
          e.last_name.toLowerCase().includes(trimmed) ||
          ('emp_id' in e && e.emp_id.toLowerCase().includes(trimmed)) ||
          ('contractor_id' in e && e.contractor_id.toLowerCase().includes(trimmed))
      )
    : [];

  const hasResults =
    matchingProducts.length > 0 ||
    matchingCustomers.length > 0 ||
    matchingOrders.length > 0 ||
    matchingEmployees.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, customers, orders, workforce (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-5">
          {!trimmed && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p className="font-medium text-slate-300 mb-1">Quick Global Navigation</p>
              <p>Type keywords to search across electronic inventory, customer accounts, orders, and employees.</p>
            </div>
          )}

          {trimmed && !hasResults && (
            <div className="py-10 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-300 text-sm mb-1">No matching results found</p>
              <p>No records matching &quot;{query}&quot; in inventory, CRM, orders, or staff.</p>
            </div>
          )}

          {/* Categorized Products */}
          {matchingProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>Products ({matchingProducts.length})</span>
              </div>
              <div className="space-y-1">
                {matchingProducts.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/products`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {p.product_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.product_id} &bull; {p.category} &bull; ${p.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categorized Customers */}
          {matchingCustomers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Customers ({matchingCustomers.length})</span>
              </div>
              <div className="space-y-1">
                {matchingCustomers.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    href={`/customers`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                        {c.first_name} {c.last_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {c.customer_id} &bull; {c.email} &bull; {c.company || 'Individual'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categorized Orders */}
          {matchingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders ({matchingOrders.length})</span>
              </div>
              <div className="space-y-1">
                {matchingOrders.slice(0, 4).map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                        {o.order_id} &mdash; ${o.order_total.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Customer: {o.customer_name} &bull; Status: {o.status}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categorized Employees */}
          {matchingEmployees.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Workforce & Contractors ({matchingEmployees.length})</span>
              </div>
              <div className="space-y-1">
                {matchingEmployees.slice(0, 4).map((e) => (
                  <Link
                    key={e.id}
                    href={`/employees`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                        {e.first_name} {e.last_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {'emp_id' in e ? e.emp_id : e.contractor_id} &bull;{' '}
                        {'department_name' in e ? e.department_name : e.agency_or_company}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
