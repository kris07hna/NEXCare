/**
 * System Diagnostics Dashboard
 * Real-time system health monitoring and diagnostics
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Activity, Server, Cpu, HardDrive, Wifi, Database,
  CheckCircle, AlertTriangle, TrendingUp, Zap,
  Globe, ArrowLeft, RefreshCw, Download
} from 'lucide-react';

interface HealthData {
  status: string;
  version: string;
  timestamp: string;
  server_ip: string;
  all_ips: string[];
  port: number;
  database: { status: string; type: string };
  ai_agents: { online: number; total: number };
}

export default function DiagnosticsPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealth = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setHealth(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const systemMetrics = [
    { label: 'Server Status', value: health?.status === 'healthy' ? 'Healthy' : health?.status || '...', max: 'OK', unit: '', status: health?.status === 'healthy' ? 'excellent' : 'warning', icon: <Cpu className="w-5 h-5" />, pct: health?.status === 'healthy' ? 20 : 80 },
    { label: 'Database', value: health?.database.status || '...', max: 'OK', unit: '', status: health?.database.status === 'connected' ? 'good' : 'warning', icon: <Database className="w-5 h-5" />, pct: health?.database.status === 'connected' ? 15 : 90 },
    { label: 'AI Agents Online', value: `${health?.ai_agents.online ?? 0}/${health?.ai_agents.total ?? 0}`, max: '', unit: '', status: (health?.ai_agents.online ?? 0) > 0 ? 'good' : 'warning', icon: <HardDrive className="w-5 h-5" />, pct: health?.ai_agents.total ? (health.ai_agents.online / health.ai_agents.total) * 100 : 0 },
    { label: 'Network IPs', value: (health?.all_ips.length ?? 0).toString(), max: '', unit: ' found', status: 'good', icon: <Wifi className="w-5 h-5" />, pct: 30 },
  ];

  const serverStatus = [
    {
      name: `Edge Server (${health?.server_ip || '...'})`,
      status: health?.status === 'healthy' ? 'online' : 'degraded',
      uptime: health?.status === 'healthy' ? '99.9%' : 'N/A',
      response: 'Local',
      load: health?.ai_agents.online ?? 0
    },
    {
      name: `Supabase (${health?.database.type || 'cloud'})`,
      status: health?.database.status === 'connected' ? 'online' : 'offline',
      uptime: health?.database.status === 'connected' ? '100%' : '0%',
      response: '~50ms',
      load: health?.database.status === 'connected' ? 10 : 0
    },
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
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Real-time health monitoring • Auto-refresh 10s • Last: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchHealth}
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

      {error && (
        <div className="mx-8 mt-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">Error: {error}</p>
        </div>
      )}

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
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{metric.label}</p>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metric.status === 'excellent' ? 'bg-emerald-500' :
                    metric.status === 'good' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, metric.pct)}%` }}
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

        {/* Network IPs */}
        {health?.all_ips && health.all_ips.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600" />
                Network Interfaces
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {health.all_ips.map((ip, idx) => (
                <div key={idx} className="px-6 py-3 flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{ip}</code>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30">PRIMARY</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
            <Globe className="w-8 h-8 mb-4" />
            <p className="text-sm opacity-80 mb-1">Server Version</p>
            <p className="text-4xl font-bold">{health?.version || '...'}</p>
            <p className="text-xs opacity-60 mt-2">Port {health?.port || '...'}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
            <Zap className="w-8 h-8 mb-4" />
            <p className="text-sm opacity-80 mb-1">AI Agents</p>
            <p className="text-4xl font-bold">{health?.ai_agents.online ?? 0} Online</p>
            <p className="text-xs opacity-60 mt-2">{health?.ai_agents.total ?? 0} Total registered</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-4" />
            <p className="text-sm opacity-80 mb-1">System Health</p>
            <p className="text-4xl font-bold capitalize">{health?.status || '...'}</p>
            <p className="text-xs opacity-60 mt-2">Database: {health?.database.status || '...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
