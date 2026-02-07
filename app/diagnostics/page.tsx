/**
 * System Diagnostics Dashboard
 * Real-time system health monitoring and diagnostics
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Activity, Server, Cpu, HardDrive, Wifi, Database,
  CheckCircle, AlertTriangle, TrendingUp, Zap,
  Globe, ArrowLeft, RefreshCw, Download
} from 'lucide-react';

export default function DiagnosticsPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const systemMetrics = [
    { label: 'CPU Usage', value: 34, max: 100, unit: '%', status: 'good', icon: <Cpu className="w-5 h-5" /> },
    { label: 'Memory', value: 8.2, max: 16, unit: 'GB', status: 'good', icon: <HardDrive className="w-5 h-5" /> },
    { label: '5G Latency', value: 2, max: 10, unit: 'ms', status: 'excellent', icon: <Wifi className="w-5 h-5" /> },
    { label: 'Database', value: 156, max: 500, unit: 'MB', status: 'good', icon: <Database className="w-5 h-5" /> },
  ];

  const serverStatus = [
    { name: 'Edge Server 1', status: 'online', uptime: '99.9%', response: '2ms', load: 34 },
    { name: 'Edge Server 2', status: 'online', uptime: '99.8%', response: '3ms', load: 28 },
    { name: 'Main Cloud Server', status: 'online', uptime: '100%', response: '12ms', load: 15 },
    { name: 'Backup Server', status: 'standby', uptime: '100%', response: '5ms', load: 0 },
  ];

  const recentEvents = [
    { time: '2 mins ago', type: 'success', message: 'NeoCare module health check passed' },
    { time: '5 mins ago', type: 'info', message: 'Database backup completed successfully' },
    { time: '12 mins ago', type: 'warning', message: 'High CPU usage detected on Room R7' },
    { time: '18 mins ago', type: 'success', message: '5G connection re-established' },
    { time: '25 mins ago', type: 'info', message: 'System update available' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Diagnostics</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Real-time health monitoring & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-semibold">Refresh</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-semibold">Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  {metric.icon}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {metric.value}{metric.unit}
                  </p>
                  <p className="text-xs text-slate-400">of {metric.max}{metric.unit}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{metric.label}</p>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metric.status === 'excellent' ? 'bg-emerald-500' :
                    metric.status === 'good' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${(metric.value / metric.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Server Status */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-6 h-6 text-blue-600" />
              Server Status
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {serverStatus.map((server, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    server.status === 'online' ? 'bg-emerald-500 animate-pulse' :
                    server.status === 'standby' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{server.name}</p>
                    <p className="text-xs text-slate-400">Uptime: {server.uptime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Response</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{server.response}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Load</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{server.load}%</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    server.status === 'online' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                    server.status === 'standby' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30'
                  }`}>
                    {server.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Recent System Events
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentEvents.map((event, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className={`p-2 rounded-lg ${
                  event.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                  event.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                }`}>
                  {event.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                   event.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                   <Activity className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{event.message}</p>
                  <p className="text-xs text-slate-400">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
            <Globe className="w-8 h-8 mb-4" />
            <p className="text-sm opacity-80 mb-1">Active Connections</p>
            <p className="text-4xl font-bold">24</p>
            <p className="text-xs opacity-60 mt-2">All systems operational</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
            <Zap className="w-8 h-8 mb-4" />
            <p className="text-sm opacity-80 mb-1">5G Throughput</p>
            <p className="text-4xl font-bold">1.2 Gbps</p>
            <p className="text-xs opacity-60 mt-2">Ultra-low latency mode</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-4" />
            <p className="text-sm opacity-80 mb-1">System Health</p>
            <p className="text-4xl font-bold">98.5%</p>
            <p className="text-xs opacity-60 mt-2">Excellent performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
