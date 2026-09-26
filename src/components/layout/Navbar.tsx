'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Database,
  ExternalLink,
  Check,
  AlertTriangle,
  AlertCircle,
  ShoppingBag,
  CheckCheck,
} from 'lucide-react';
import { useElectroHub } from '@/lib/store';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  isSidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  isSidebarCollapsed,
}) => {
  const pathname = usePathname();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    settings,
    updateSettings,
    isSupabaseActive,
    user,
  } = useElectroHub();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Format Page Title from route
  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/products') return 'Electronic Products';
    if (path === '/inventory') return 'Inventory Control & Stock';
    if (path === '/orders') return 'Order Management & Fulfillment';
    if (path === '/customers') return 'Customer Accounts & CRM';
    if (path === '/employees') return 'Workforce & Contractors';
    if (path === '/discontinued-products') return 'Discontinued Registry';
    if (path === '/analytics') return 'Analytics & Business Intelligence';
    if (path === '/settings') return 'System Settings & Database';
    if (path === '/profile') return 'Admin Profile & Security';
    if (path === '/help') return 'Documentation & Help Center';
    return 'ElectroHub Portal';
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header
      className={`h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}
    >
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            ElectroHub Enterprise Component Systems
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-xs"
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Search...</span>
          <span className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </span>
        </button>

        {/* Supabase Status Indicator */}
        <Link
          href="/settings"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors"
          style={{
            backgroundColor: isSupabaseActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
            borderColor: isSupabaseActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)',
            color: isSupabaseActive ? '#34d399' : '#60a5fa',
          }}
          title="Click to configure Supabase Connection"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSupabaseActive ? 'Supabase Connected' : 'Local Storage Mode'}</span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Real-time Notifications Popover */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    System Alerts & Activity
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    <Check className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                    All operational metrics nominal. No active stock alerts.
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const iconConfig = {
                      out_of_stock: { icon: AlertCircle, color: 'text-rose-400 bg-rose-500/10' },
                      low_stock: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10' },
                      order: { icon: ShoppingBag, color: 'text-blue-400 bg-blue-500/10' },
                      system: { icon: Bell, color: 'text-slate-400 bg-slate-800' },
                    }[notif.type];
                    const Icon = iconConfig.icon;

                    return (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3.5 hover:bg-slate-800/50 transition-colors flex items-start gap-3 cursor-pointer ${
                          !notif.read ? 'bg-slate-800/20' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${iconConfig.color} flex-shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white leading-tight">{notif.title}</p>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                            {notif.link && (
                              <Link
                                href={notif.link}
                                onClick={() => setShowNotifications(false)}
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Popover */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-md shadow-blue-500/20">
              {user ? user.first_name[0] : 'A'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'Admin Account'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user ? user.email : 'admin@electrohub.io'}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
                >
                  My Profile & Credentials
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
                >
                  System & Database Settings
                </Link>
                <Link
                  href="/help"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
                >
                  Help Center & FAQs
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
