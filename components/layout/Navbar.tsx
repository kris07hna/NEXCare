/**
 * EdgeCare-5G Navbar Component - Premium Design
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, Video, BarChart3, Bell, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', icon: Activity, label: 'Dashboard' },
  { href: '/patients', icon: Users, label: 'Patients' },
  { href: '/consultations', icon: Video, label: 'Consultations' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pages that have their own sidebar/full-layout navigation
  const pagesWithOwnNav = ['/', '/patients', '/neocare', '/room-monitoring', '/diagnostics'];
  const shouldHide = pagesWithOwnNav.some(p => 
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  );

  if (shouldHide) return null;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white pulse-dot" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Edge<span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Care</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase -mt-1">5G Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : ''}`} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-700">System Online</span>
            </div>

            {/* Notifications */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Avatar / Profile */}
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              Dr
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-100 mt-2">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : ''}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
