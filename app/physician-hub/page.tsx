/**
 * Physician Consultation Hub | EdgeCare-5G
 * Comprehensive physician workspace with patient queue, active consultation, and utilities
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Bell, Settings, Activity, List, Users, Calendar, Clock,
  Zap, FileText, User, Droplet, TrendingUp, Video, Eye, AlertCircle,
  History, Pill, Copy, Save, Bold, MoreHorizontal, Plus, Signal
} from 'lucide-react';

interface QueuePatient {
  id: string;
  name: string;
  priority: 'critical' | 'urgent' | 'routine';
  waitTime: string;
  description: string;
  age: number;
  priorityLevel: number;
}

export default function PhysicianHubPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickNotes, setQuickNotes] = useState('');

  const queuePatients: QueuePatient[] = [
    {
      id: '1',
      name: 'Robert Smith',
      priority: 'critical',
      waitTime: '04:12m wait',
      description: 'Severe Chest Pain, Tachycardia',
      age: 54,
      priorityLevel: 1,
    },
    {
      id: '2',
      name: 'Sarah Jenkins',
      priority: 'urgent',
      waitTime: '12:45m wait',
      description: 'Post-Op Wound Infection',
      age: 29,
      priorityLevel: 2,
    },
    {
      id: '3',
      name: 'Michael Chang',
      priority: 'routine',
      waitTime: '18:20m wait',
      description: 'Allergy Consultation, Chronic',
      age: 41,
      priorityLevel: 3,
    },
    {
      id: '4',
      name: 'Elena Rodriguez',
      priority: 'routine',
      waitTime: '22:05m wait',
      description: 'Diabetes Follow-up',
      age: 62,
      priorityLevel: 3,
    },
  ];

  const activePatient = queuePatients[0]; // Robert Smith

  const quickMetrics: Array<{
    label: string;
    value: string;
    trend?: string;
    icon: React.ReactNode;
    color: 'blue' | 'orange' | 'green' | 'purple';
  }> = [
    { label: 'Patients Seen', value: '14', trend: '+2 Today', icon: <Users className="w-5 h-5" />, color: 'blue' },
    { label: 'Avg. Wait Time', value: '12m', trend: '-4m vs yesterday', icon: <Clock className="w-5 h-5" />, color: 'orange' },
    { label: 'System Latency', value: '4.2ms', trend: '', icon: <Zap className="w-5 h-5" />, color: 'green' },
    { label: 'Consultation Hrs', value: '6.5h', trend: '', icon: <FileText className="w-5 h-5" />, color: 'purple' },
  ];

  const upcomingSchedule = [
    { date: 'Oct 12', time: '14:00', title: 'Follow-up: Miller', subtitle: 'Teleconsult', active: true },
    { date: 'Oct 12', time: '15:30', title: 'Surgical Review', subtitle: 'Clinic Room 4', active: false },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">EdgeCare-5G</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-blue-600 text-sm font-semibold border-b-2 border-blue-600 py-1" href="#">
              Consultation Hub
            </a>
            <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-blue-600 transition-colors" href="/patients">
              Patient Records
            </a>
            <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-blue-600 transition-colors" href="#">
              Analytics
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* 5G Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
            <Signal className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-green-500 uppercase tracking-wider">5G Core Online</span>
            <span className="text-[10px] text-green-500/70 font-mono ml-1">4ms Latency</span>
          </div>
          <div className="flex gap-2 border-l border-slate-200 dark:border-slate-800 ml-4 pl-4">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="absolute top-2 right-2 size-2 bg-red-600 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          <div className="flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-slate-800 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">Dr. Julianne Moore</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Senior Physician</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-full size-10 overflow-hidden border-2 border-blue-600/20"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden h-[calc(100vh-65px)]">
        {/* Left Sidebar: Patient Queue */}
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <List className="w-5 h-5 text-blue-600" />
                Awaiting Consultation
              </h3>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                12
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border-none text-sm rounded-lg pl-10 py-2 focus:ring-1 focus:ring-blue-600 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Search queue..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {queuePatients.map((patient) => (
              <PatientQueueCard key={patient.id} patient={patient} />
            ))}
          </div>
        </aside>

        {/* Center Panel: Workspace */}
        <section className="flex-1 bg-background-light dark:bg-background-dark p-6 overflow-y-auto flex flex-col gap-6">
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-4 gap-4">
            {quickMetrics.map((metric, idx) => (
              <QuickMetricCard key={idx} {...metric} />
            ))}
          </div>

          {/* Active Workspace Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-full max-h-[600px]">
            {/* Workspace Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex gap-4">
                <div className="size-16 rounded-xl overflow-hidden border-2 border-blue-600/20 bg-gradient-to-br from-blue-400 to-purple-500"></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activePatient.name}</h2>
                    <span className="bg-red-600/10 text-red-600 text-xs font-bold px-2 py-0.5 rounded border border-red-600/20 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Critical Alert
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> Male, 54y
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplet className="w-3 h-3" /> A+ Positive
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Ward 4B, Bed 12
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    View Full History
                  </button>
                  <button
                    onClick={() => router.push(`/consultation/${activePatient.id}`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Join 5G Room
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Encrypted Low-Latency Stream (AES-256)</p>
              </div>
            </div>

            {/* Workspace Content: Vitals & Summary */}
            <div className="flex-1 p-6 grid grid-cols-3 gap-6 overflow-y-auto">
              {/* Real-time Vitals */}
              <div className="col-span-1 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Vitals</h4>
                <div className="space-y-3">
                  <VitalCard label="Heart Rate" value="112" unit="bpm" status="Elevated" statusColor="red" progress={75} />
                  <VitalCard label="SpO2 Level" value="96" unit="%" status="Stable" statusColor="green" progress={96} />
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500">Blood Pressure</span>
                      <span className="text-xs text-orange-600 font-bold">High-Normal</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">142/95</span>
                      <span className="text-[10px] text-slate-400">mmHg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Summary */}
              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case Summary (AI Assisted)</h4>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                    Last updated 2m ago
                  </span>
                </div>
                <div className="text-sm space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Robert was admitted at 08:30 AM with acute substernal chest pain radiating to the left arm. Patient describes it as "crushing pressure."
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-600/5 dark:bg-blue-600/10 rounded-xl border border-blue-600/10">
                      <h5 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
                        <History className="w-3 h-3" /> Known Comorbidities
                      </h5>
                      <ul className="text-xs space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-400">
                        <li>Type 2 Diabetes (HbA1c: 7.2)</li>
                        <li>Hyperlipidemia</li>
                        <li>Hypertension (Grade 1)</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
                      <h5 className="text-xs font-bold text-orange-600 mb-2 flex items-center gap-1">
                        <Pill className="w-3 h-3" /> Active Medications
                      </h5>
                      <ul className="text-xs space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-400">
                        <li>Metformin 500mg BID</li>
                        <li>Atorvastatin 20mg QD</li>
                        <li>Lisinopril 10mg QD</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 mb-2">Recent Lab Highlights</h5>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-medium px-2 py-1 rounded">
                        Troponin: 0.04 ng/mL
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-medium px-2 py-1 rounded">
                        Creatinine: 1.1 mg/dL
                      </span>
                      <span className="bg-red-600/10 text-red-600 text-[10px] font-bold px-2 py-1 rounded">
                        Glucose: 185 mg/dL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Utils */}
        <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
          {/* Calendar Widget */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Schedule
              </h3>
              <button className="text-xs font-semibold text-blue-600">View All</button>
            </div>
            <div className="space-y-4">
              {upcomingSchedule.map((appointment, idx) => (
                <ScheduleCard key={idx} {...appointment} />
              ))}
            </div>
          </div>

          {/* Quick Notes Sidebar */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Quick Notes
              </h3>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 transition-colors">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
              <div className="flex gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                <button className="size-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">
                  <Bold className="w-3 h-3" />
                </button>
                <button className="size-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">
                  <List className="w-3 h-3" />
                </button>
                <button className="size-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </div>
              <textarea
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 w-full resize-none outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                placeholder="Type rapid notes here during call..."
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
              ></textarea>
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-1">
                  <span className="bg-blue-600/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-600/20 transition-colors">
                    #followup
                  </span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    #referral
                  </span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    #urgent_lab
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Help/Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 mt-auto border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">Platform Support: Ext 401</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Action: Quick Patient Addition */}
      <button className="fixed bottom-6 right-96 size-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40 hidden lg:flex">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

function PatientQueueCard({ patient }: { patient: QueuePatient }) {
  const priorityConfig = {
    critical: {
      bg: 'bg-red-600/5 dark:bg-red-600/10 border-red-600/20 hover:border-red-600/40',
      badge: 'bg-red-600/10 text-red-600',
      dot: 'bg-red-600 animate-pulse',
      label: 'CRITICAL',
    },
    urgent: {
      bg: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800',
      badge: 'bg-orange-600/10 text-orange-600',
      dot: 'bg-orange-600',
      label: 'URGENT',
    },
    routine: {
      bg: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800',
      badge: 'bg-blue-600/10 text-blue-600',
      dot: 'bg-blue-600',
      label: 'ROUTINE',
    },
  };

  const config = priorityConfig[patient.priority];

  return (
    <div className={`p-3 border rounded-xl transition-all cursor-pointer group ${config.bg}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${config.badge}`}>
          {config.label}
        </span>
        <span className="text-xs text-slate-500 font-mono">{patient.waitTime}</span>
      </div>
      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
        {patient.name}
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">{patient.description}</p>
      <div className="flex items-center gap-2">
        <div className={`size-1.5 rounded-full ${config.dot}`}></div>
        <span className="text-[10px] font-medium text-slate-500">
          Priority {patient.priorityLevel} • Age {patient.age}
        </span>
      </div>
    </div>
  );
}

function QuickMetricCard({ label, value, trend, icon, color }: {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-600/10 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
      <div className={`size-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-lg font-bold">
          {value}{' '}
          {trend && (
            <span className={`text-[10px] font-normal ${trend.includes('-') ? 'text-red-600' : 'text-green-500'}`}>
              {trend}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function VitalCard({ label, value, unit, status, statusColor, progress }: {
  label: string;
  value: string | number;
  unit: string;
  status: string;
  statusColor: 'red' | 'green';
  progress: number;
}) {
  const statusColors = {
    red: 'text-red-600',
    green: 'text-green-500',
  };

  const progressColors = {
    red: 'bg-red-600',
    green: 'bg-green-500',
  };

  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={`text-xs font-bold flex items-center gap-1 ${statusColors[statusColor]}`}>
          {statusColor === 'red' && <TrendingUp className="w-3 h-3" />}
          {status}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-[10px] text-slate-400">{unit}</span>
      </div>
      <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${progressColors[statusColor]}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function ScheduleCard({ date, time, title, subtitle, active }: any) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        active
          ? 'bg-slate-50 dark:bg-slate-800 border-l-4 border-blue-600'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <div className="text-center min-w-8">
        <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">{date.split(' ')[0]}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-none mt-1">{date.split(' ')[1]}</p>
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold leading-none">{title}</p>
        <p className="text-[10px] text-slate-500 mt-1">
          {time} - {subtitle}
        </p>
      </div>
    </div>
  );
}
