/**
 * NeoCare-AI Pediatric Dashboard
 * Specialized neonatal/infant monitoring interface
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Bell, Thermometer, Droplets, Bed, Heart, Wind, Timer,
  AlertCircle, Moon, TrendingUp, ChevronRight, Activity
} from 'lucide-react';

interface InfantData {
  id: string;
  name: string;
  bedNumber: string;
  status: 'stable' | 'critical' | 'observation';
  aiConfidence: number;
  sleepState: 'deep-sleep' | 'light-sleep' | 'awake';
  sleepDuration: string;
  heartRate: number;
  spo2: number;
  cycleProgress: number;
  imageUrl?: string;
}

export default function NeoCareAIPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const infants: InfantData[] = [
    {
      id: '1',
      name: 'Mia',
      bedNumber: '01',
      status: 'stable',
      aiConfidence: 98.4,
      sleepState: 'deep-sleep',
      sleepDuration: '02:15:40',
      heartRate: 124,
      spo2: 99,
      cycleProgress: 66,
    },
    {
      id: '2',
      name: 'Leo',
      bedNumber: '04',
      status: 'critical',
      aiConfidence: 99.2,
      sleepState: 'awake',
      sleepDuration: '00:45:12',
      heartRate: 168,
      spo2: 94,
      cycleProgress: 35,
    },
    {
      id: '3',
      name: 'Emma',
      bedNumber: '07',
      status: 'stable',
      aiConfidence: 97.8,
      sleepState: 'light-sleep',
      sleepDuration: '01:30:22',
      heartRate: 118,
      spo2: 98,
      cycleProgress: 52,
    },
    {
      id: '4',
      name: 'Noah',
      bedNumber: '10',
      status: 'observation',
      aiConfidence: 96.5,
      sleepState: 'deep-sleep',
      sleepDuration: '03:05:18',
      heartRate: 115,
      spo2: 97,
      cycleProgress: 78,
    },
  ];

  const environmentalData = {
    temperature: 22.4,
    humidity: 45,
    occupancy: { current: 12, total: 16 },
  };

  return (
    <div className="transition-colors duration-300 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-4 md:px-10">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg"></div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                NeoCare<span className="text-purple-600">-AI</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400">
                Precision Pediatric Network
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-purple-600 text-sm font-bold border-b-2 border-purple-600 pb-1" href="#">
              Dashboard
            </a>
            <a className="text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-purple-600 transition-colors" href="#">
              Registry
            </a>
            <a className="text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-purple-600 transition-colors flex items-center gap-1.5" href="#">
              Critical Alerts{' '}
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">2</span>
            </a>
            <a className="text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-purple-600 transition-colors" href="#">
              Clinical Units
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              className="pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:border-purple-600/30 focus:ring-4 focus:ring-purple-600/10 text-xs w-72 outline-none"
              placeholder="Search by Patient ID or Bed No..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-5">
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="w-9 h-9 rounded-lg bg-slate-200 overflow-hidden ring-2 ring-slate-50 dark:ring-slate-800 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-cyan-400"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Critical Alert Banner */}
      <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600 w-5 h-5" />
          <p className="text-xs font-semibold text-red-800 dark:text-red-400">
            <span className="font-extrabold uppercase mr-2 tracking-wide text-[10px] bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">
              Critical
            </span>{' '}
            HR Deviation in Bed #04 (Infant Leo). Automated triage confirms 99% accuracy.
          </p>
        </div>
        <button className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1 rounded transition-colors">
          Launch Rapid View
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-10 space-y-10 max-w-screen-2xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Bed className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Neo-Natal Unit • Zone B</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              Unit Command Center
            </h2>
          </div>

          {/* Environmental Stats */}
          <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
            <EnvironmentalCard
              icon={<Thermometer className="w-5 h-5" />}
              label="Amb. Temp"
              value={`${environmentalData.temperature}°C`}
              color="cyan"
            />
            <EnvironmentalCard
              icon={<Droplets className="w-5 h-5" />}
              label="Humidity"
              value={`${environmentalData.humidity}%`}
              color="purple"
            />
            <EnvironmentalCard
              icon={<Bed className="w-5 h-5" />}
              label="Cen. Occ."
              value={`${environmentalData.occupancy.current} / ${environmentalData.occupancy.total}`}
              color="slate"
            />
          </div>
        </div>

        {/* Infant Monitoring Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {infants.map((infant) => (
              <InfantCard key={infant.id} infant={infant} />
            ))}
          </div>

          {/* Right Sidebar - AI Insights */}
          <div className="lg:col-span-4 space-y-6">
            <AIInsightsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}

function EnvironmentalCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'cyan' | 'purple' | 'slate';
}) {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-500',
    purple: 'bg-purple-600/10 text-purple-600',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[160px] flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function InfantCard({ infant }: { infant: InfantData }) {
  const isCritical = infant.status === 'critical';

  const statusConfig = {
    stable: { bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', label: 'Stable Condition' },
    critical: { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Critical Alert' },
    observation: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Observation' },
  };

  const sleepConfig = {
    'deep-sleep': { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', label: 'Deep Sleep', icon: <Moon className="w-4 h-4" /> },
    'light-sleep': { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400', label: 'Light Sleep', icon: <Moon className="w-4 h-4" /> },
    'awake': { bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400', label: 'Awake', icon: <Activity className="w-4 h-4" /> },
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl p-6 border shadow-sm hover:border-purple-600/30 transition-all group relative overflow-hidden ${
        isCritical ? 'border-2 border-purple-600/40 shadow-xl shadow-purple-600/5' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {isCritical && (
        <div className="absolute top-2 right-2">
          <AlertCircle className="w-4 h-4 text-purple-600 animate-pulse" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-purple-100 dark:border-purple-600/10 overflow-hidden shadow-inner bg-gradient-to-br from-purple-400 to-cyan-400"></div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Bed {infant.bedNumber} • {infant.name}</h3>
            <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide ${statusConfig[infant.status].bg}`}>
              {statusConfig[infant.status].label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-extrabold text-slate-400">
            AI SENSING <br /> <span className="text-purple-600">{infant.aiConfidence}% CONF</span>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-3 mb-6">
        <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${sleepConfig[infant.sleepState].bg}`}>
          {sleepConfig[infant.sleepState].icon}
          <span className="text-[11px] font-bold uppercase tracking-wide">{sleepConfig[infant.sleepState].label}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Timer className="w-4 h-4" />
          <span className="text-[11px] font-semibold tracking-wide">{infant.sleepDuration}</span>
        </div>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">BPM Avg</span>
          </div>
          <div className={`text-2xl font-extrabold font-display ${isCritical ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}>
            {infant.heartRate}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">SpO2 Level</span>
          </div>
          <div className={`text-2xl font-extrabold font-display ${infant.spo2 < 95 ? 'text-amber-600' : 'text-slate-800 dark:text-white'}`}>
            {infant.spo2}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Cycle Progress</span>
          <span>{infant.cycleProgress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-purple-600" style={{ width: `${infant.cycleProgress}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function AIInsightsPanel() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-600" />
        AI Insights
      </h3>
      <div className="space-y-4">
        <InsightItem
          title="Sleep Pattern Optimization"
          description="3 infants showing improved REM cycles since environmental adjustment"
          trend="positive"
          time="5 min ago"
        />
        <InsightItem
          title="Temperature Variance"
          description="Ambient temp increased by 0.3°C. AI recommends no action at this time."
          trend="neutral"
          time="12 min ago"
        />
        <InsightItem
          title="Critical Alert Resolved"
          description="Bed #02 HR normalized. Automatic notification sent to Dr. Williams."
          trend="positive"
          time="28 min ago"
        />
      </div>
      <button className="w-full mt-6 py-3 text-purple-600 text-xs font-bold border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-600 hover:bg-purple-600/5 transition-all uppercase tracking-wider flex items-center justify-center gap-2">
        View Full Log <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function InsightItem({ title, description, trend, time }: { title: string; description: string; trend: 'positive' | 'neutral' | 'negative'; time: string }) {
  const trendColors = {
    positive: 'text-emerald-500',
    neutral: 'text-slate-400',
    negative: 'text-red-500',
  };

  return (
    <div className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
        <TrendingUp className={`w-4 h-4 ${trendColors[trend]}`} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{description}</p>
      <span className="text-[10px] text-slate-400">{time}</span>
    </div>
  );
}
