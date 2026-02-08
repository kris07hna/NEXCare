/**
 * Analytics Dashboard - Premium metrics and visualizations
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Activity, Users, Video, AlertCircle, TrendingUp,
  Clock, Download, Cpu, Shield, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import type { AIReport, Patient } from '@/types';

interface ConsultationRecord {
  id: string;
  startTime: string;
  durationSeconds?: number;
  [key: string]: unknown;
}

import { format, subDays, startOfDay } from 'date-fns';

const CHART_COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

// Types
interface AnalyticsData {
  totalReports: number;
  totalConsultations: number;
  activePatients: number;
  avgConsultationDuration: number;
  criticalAlerts: number;
  reportsByModule: { module: string; count: number }[];
  reportsByDay: { date: string; count: number }[];
  alertLevelDistribution: { level: string; count: number }[];
}

import { format, subDays, startOfDay } from 'date-fns';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const reportsRes = await fetch('/api/reports?limit=1000');
      const reportsData = await reportsRes.json();
      const reports = reportsData.reports || [];

      const consultationsRes = await fetch('/api/consultations?limit=1000');
      const consultations = consultationsRes.ok ? await consultationsRes.json() : [];

      const patientsRes = await fetch('/api/patients');
      const patients = await patientsRes.json();

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoffDate = subDays(new Date(), days);

      const recentReports = reports.filter((r: AIReport) =>
        new Date(r.created_at || '').getTime() > cutoffDate.getTime()
      );

      const recentConsultations: ConsultationRecord[] = Array.isArray(consultations)
        ? consultations.filter((c: ConsultationRecord) => new Date(c.startTime).getTime() > cutoffDate.getTime())
        : [];

      const moduleCount = recentReports.reduce((acc: Record<string, number>, report: AIReport) => {
        acc[report.module] = (acc[report.module] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const reportsByModule = Object.entries(moduleCount).map(([module, count]) => ({
        module: module.replace('-AI', ''),
        count: count as number,
      }));

      const reportsByDay = Array.from({ length: Math.min(days, 30) }, (_, i) => {
        const totalDays = Math.min(days, 30);
        const date = subDays(new Date(), totalDays - 1 - i);
        const dayStart = startOfDay(date);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const count = recentReports.filter((r: AIReport) => {
          const reportDate = new Date(r.created_at || '');
          return reportDate >= dayStart && reportDate < dayEnd;
        }).length;

        return { date: format(date, 'MMM dd'), count };
      });

      const alertCount = recentReports.reduce((acc: Record<string, number>, report: AIReport) => {
        const level = report.alert_level || 'normal';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alertLevelDistribution = [
        { level: 'Normal', count: alertCount.normal || 0 },
        { level: 'Warning', count: alertCount.warning || 0 },
        { level: 'Critical', count: alertCount.critical || 0 },
      ];

      const completedConsultations = recentConsultations.filter((c: ConsultationRecord) => c.durationSeconds);
      const avgDuration = completedConsultations.length > 0
        ? completedConsultations.reduce((sum: number, c: ConsultationRecord) => sum + (c.durationSeconds || 0), 0) / completedConsultations.length
        : 0;

      const patientsList = patients.patients || patients;

      setAnalytics({
        totalReports: recentReports.length,
        totalConsultations: recentConsultations.length,
        activePatients: Array.isArray(patientsList) ? patientsList.filter((p: Patient) => p.status === 'active').length : 0,
        avgConsultationDuration: Math.round(avgDuration),
        criticalAlerts: alertCount.critical || 0,
        reportsByModule,
        reportsByDay,
        alertLevelDistribution,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-25" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <BarChart3 className="h-7 w-7 animate-pulse text-indigo-600" />
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="text-lg font-bold text-red-900">Failed to load analytics data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
              <p className="text-sm text-slate-500">System performance and insights</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Time Range Selector */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10 stagger-children">
        <MetricCard
          icon={<Activity className="h-5 w-5" />}
          title="AI Reports"
          value={analytics.totalReports}
          iconBg="from-indigo-50 to-indigo-100"
          iconColor="text-indigo-600"
        />
        <MetricCard
          icon={<Video className="h-5 w-5" />}
          title="Consultations"
          value={analytics.totalConsultations}
          iconBg="from-violet-50 to-violet-100"
          iconColor="text-violet-600"
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          title="Active Patients"
          value={analytics.activePatients}
          iconBg="from-cyan-50 to-cyan-100"
          iconColor="text-cyan-600"
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          title="Avg Duration"
          value={formatDuration(analytics.avgConsultationDuration)}
          isString
          iconBg="from-emerald-50 to-emerald-100"
          iconColor="text-emerald-600"
        />
        <MetricCard
          icon={<AlertCircle className="h-5 w-5" />}
          title="Critical Alerts"
          value={analytics.criticalAlerts}
          danger={analytics.criticalAlerts > 0}
          iconBg={analytics.criticalAlerts > 0 ? "from-red-50 to-red-100" : "from-emerald-50 to-emerald-100"}
          iconColor={analytics.criticalAlerts > 0 ? "text-red-600" : "text-emerald-600"}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Reports Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">AI Reports Trend</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
              Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.reportsByDay}>
              <defs>
                <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#reportGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                name="Reports"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Module Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Reports by Module</h3>
            <Cpu className="h-4 w-4 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.reportsByModule} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="module" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Reports">
                {analytics.reportsByModule.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alert Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Alert Distribution</h3>
            <Shield className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={analytics.alertLevelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {analytics.alertLevelDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.level === 'Critical' ? '#ef4444'
                        : entry.level === 'Warning' ? '#f59e0b'
                        : '#10b981'
                      }
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-4">
              {analytics.alertLevelDistribution.map((item) => (
                <div key={item.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${
                      item.level === 'Critical' ? 'bg-red-500'
                      : item.level === 'Warning' ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    }`} />
                    <span className="text-sm font-medium text-slate-700">{item.level}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">System Health</h3>
            <Zap className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-5">
            <HealthMetric label="Database" value={100} icon={<Cpu className="h-4 w-4" />} />
            <HealthMetric label="WebRTC Service" value={98} icon={<Video className="h-4 w-4" />} />
            <HealthMetric label="AI Agents Online" value={66} icon={<Activity className="h-4 w-4" />} />
            <HealthMetric label="Network Quality" value={92} icon={<Zap className="h-4 w-4" />} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Premium Metric Card Component
function MetricCard({
  icon,
  title,
  value,
  isString,
  danger,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  isString?: boolean;
  danger?: boolean;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-white shadow-sm border p-5 card-hover ${
        danger ? 'border-red-100 bg-red-50/30' : 'border-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${danger ? 'text-red-700' : 'text-slate-900'}`}>
        {isString ? value : String(value)}
      </p>
      <p className="text-xs text-slate-500 font-medium mt-1">{title}</p>
    </motion.div>
  );
}

// Premium Health Metric Component
function HealthMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  const getColor = (v: number) => {
    if (v >= 90) return { bar: 'from-emerald-400 to-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (v >= 70) return { bar: 'from-amber-400 to-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' };
    return { bar: 'from-red-400 to-red-500', text: 'text-red-600', bg: 'bg-red-50' };
  };

  const colors = getColor(value);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <span className={`text-sm font-bold ${colors.text}`}>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
        />
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0m';
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
}
