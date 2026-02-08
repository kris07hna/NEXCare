/**
 * GeriCare-AI Fall Monitoring Dashboard
 * Specialized elderly care monitoring with fall detection
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, Bell, Settings, Send, Users, Grid3X3, Radio, History,
  AlertTriangle, Phone, X, Bed, TrendingUp, Clock, Shield
} from 'lucide-react';

interface RoomData {
  id: string;
  roomNumber: string;
  patientName: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  activityState: 'walking' | 'resting' | 'bathroom' | 'fallen';
  activityProgress: number;
  lastUpdate: string;
}

interface RecentExit {
  roomNumber: string;
  patientName: string;
  description: string;
  timeAgo: string;
  severity: 'warning' | 'info';
}

export default function GeriCareAIPage() {
  const router = useRouter();
  const [showCriticalAlert, setShowCriticalAlert] = useState(true);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  // Merged: using 'live_feed' as a possible view state along with upstream states
  const [currentView, setCurrentView] = useState<'dashboard' | 'sensors' | 'logs' | 'live_feed'>('dashboard');
  const [emergencyCallInProgress, setEmergencyCallInProgress] = useState(false);

  const rooms: RoomData[] = [
    {
      id: '1',
      roomNumber: '101',
      patientName: 'John Doe',
      riskLevel: 'low',
      activityState: 'walking',
      activityProgress: 75,
      lastUpdate: 'Live',
    },
    {
      id: '2',
      roomNumber: '105',
      patientName: 'Alice Smith',
      riskLevel: 'moderate',
      activityState: 'resting',
      activityProgress: 0,
      lastUpdate: 'Live',
    },
    {
      id: '3',
      roomNumber: '204',
      patientName: 'Sam Wilson',
      riskLevel: 'moderate',
      activityState: 'bathroom',
      activityProgress: 60,
      lastUpdate: '2m ago',
    },
    {
      id: '4',
      roomNumber: '302',
      patientName: 'Martha Jenkins',
      riskLevel: 'critical',
      activityState: 'fallen',
      activityProgress: 0,
      lastUpdate: '45s ago',
    },
  ];

  const recentExits: RecentExit[] = [
    {
      roomNumber: '204',
      patientName: 'Sam Wilson',
      description: 'Unscheduled exit detected',
      timeAgo: '2m ago',
      severity: 'warning',
    },
    {
      roomNumber: '105',
      patientName: 'Alice Smith',
      description: 'Bathroom trip started',
      timeAgo: '14m ago',
      severity: 'info',
    },
  ];

  const handleEmergencyCall = () => {
    setEmergencyCallInProgress(true);
    // Simulate emergency call
    setTimeout(() => {
      alert('Emergency services have been notified! Response team dispatched to Room 302.');
      setEmergencyCallInProgress(false);
      setShowEmergencyDialog(false);
    }, 2000);
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              GeriCare-AI
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 ml-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`text-sm font-semibold transition-colors ${currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              Live Monitor
            </button>
            <button
              onClick={() => setCurrentView('live_feed')}
              className={`text-sm font-semibold transition-colors ${currentView === 'live_feed' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              AI Camera Feed
            </button>
            <a className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" href="#">
              Patients
            </a>
            <a className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" href="#">
              Reports
            </a>
            <a className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" href="#">
              Settings
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-full">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
              EdgeCare-5G Active
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600"></span>
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">Nurse Sarah J.</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tighter">
                On Duty • Floor 3
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-blue-600"></div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="space-y-1 mb-6">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Monitoring</p>
            <SidebarButton
              icon={<Grid3X3 className="w-5 h-5" />}
              label="Dashboard"
              active={currentView === 'dashboard'}
              onClick={() => setCurrentView('dashboard')}
            />
            <SidebarButton
              icon={<Radio className="w-5 h-5" />}
              label="Live AI Feed"
              active={currentView === 'live_feed'}
              onClick={() => setCurrentView('live_feed')}
            />
            <SidebarButton
              icon={<Activity className="w-5 h-5" />}
              label="Sensor Status"
              active={currentView === 'sensors'}
              onClick={() => setCurrentView('sensors')}
            />
            <SidebarButton
              icon={<History className="w-5 h-5" />}
              label="Activity Logs"
              active={currentView === 'logs'}
              onClick={() => setCurrentView('logs')}
            />
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Recent Bed Exits
            </p>
            {recentExits.map((exit, idx) => (
              <div
                key={idx}
                className={`px-3 py-3 rounded-lg border mb-2 ${exit.severity === 'warning'
                  ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-70'
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-xs font-bold ${exit.severity === 'warning'
                      ? 'text-orange-700 dark:text-orange-400'
                      : 'text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    Room {exit.roomNumber}
                  </span>
                  <span
                    className={`text-[10px] ${exit.severity === 'warning' ? 'text-orange-600/70' : 'text-slate-500'
                      }`}
                  >
                    {exit.timeAgo}
                  </span>
                </div>
                <p
                  className={`text-xs ${exit.severity === 'warning'
                    ? 'text-orange-800 dark:text-orange-300'
                    : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {exit.patientName}: {exit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <button
              onClick={() => setShowEmergencyDialog(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-red-700 transition-colors"
            >
              <Send className="w-5 h-5" />
              EMERGENCY CALL
            </button>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">

          {/* Live AI Feed View */}
          {currentView === 'live_feed' && (
            <div className="flex flex-col gap-6 h-full">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live AI Camera Feed</h2>
                  <p className="text-slate-500">Real-time processing with YOLOv8 Fall Detection</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-bold">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  LIVE
                </div>
              </div>

              <div className="relative aspect-video w-full max-w-4xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                <img
                  src="http://localhost:5000/video_feed"
                  alt="Live Fall Detection Feed"
                  className="w-full h-full object-contain"
                />

                {/* Overlay Info */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs font-mono text-green-400 border border-green-500/30">
                    System: ONLINE
                  </div>
                  <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs font-mono text-blue-400 border border-blue-500/30">
                    Model: YOLOv8
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Detection Status</h3>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">Active Monitoring</span>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Camera Source</h3>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Radio className="w-5 h-5" />
                    <span className="font-medium">USB Webcam / Local</span>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Frame Rate</h3>
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">~30 FPS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <>
              {/* CRITICAL ALERT PANEL */}
              {showCriticalAlert && (
                <section className="mb-8">
                  <div className="shadow-[0_0_20px_rgba(220,38,38,0.4)] relative overflow-hidden flex flex-col md:flex-row items-center gap-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-600 p-6 ring-4 ring-red-500/10">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white">
                      <AlertTriangle className="w-12 h-12 animate-bounce" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-wrap items-center gap-3 mb-1 justify-center md:justify-start">
                        <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-widest">
                          CRITICAL ALERT
                        </span>
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          DETECTED 45s AGO
                        </span>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                        FALL DETECTED: ROOM 302
                      </h2>
                      <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                        Martha Jenkins <span className="text-slate-400 mx-2">|</span> High Fall Risk Profile{' '}
                        <span className="text-slate-400 mx-2">|</span> Motion Sensor A2
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                        <Phone className="w-5 h-5" />
                        Verify & Call
                      </button>
                      <button
                        onClick={() => setShowCriticalAlert(false)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-4 text-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Room Grid */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bed className="w-5 h-5 text-blue-600" />
                    Active Room Monitoring
                  </h3>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span> Movement
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-slate-300"></span> Still
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={<Shield className="w-6 h-6" />}
                  label="Fall Prevention Rate"
                  value="98.7%"
                  trend="+2.3%"
                  color="emerald"
                />
                <StatCard
                  icon={<Clock className="w-6 h-6" />}
                  label="Avg Response Time"
                  value="47s"
                  trend="-12s"
                  color="blue"
                />
                <StatCard
                  icon={<Users className="w-6 h-6" />}
                  label="Monitored Patients"
                  value="24"
                  trend="+3"
                  color="purple"
                />
              </div>
            </>
          )}

          {/* Sensor Status View */}
          {currentView === 'sensors' && <SensorStatusView />}

          {/* Activity Logs View */}
          {currentView === 'logs' && <ActivityLogsView />}
        </main>
      </div>

      {/* Emergency Call Dialog */}
      {showEmergencyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-600">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Call</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              This will immediately alert the emergency response team and on-duty staff. Are you sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleEmergencyCall}
                disabled={emergencyCallInProgress}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emergencyCallInProgress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Call Now
                  </>
                )}
              </button>
              <button
                onClick={() => setShowEmergencyDialog(false)}
                disabled={emergencyCallInProgress}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${active
          ? 'bg-blue-600/10 text-blue-600'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SensorStatusView() {
  const sensors = [
    { id: 'A1', room: '101', status: 'online', battery: 87, lastUpdate: '2s ago' },
    { id: 'A2', room: '302', status: 'online', battery: 45, lastUpdate: '1s ago' },
    { id: 'B1', room: '105', status: 'online', battery: 92, lastUpdate: '3s ago' },
    { id: 'B2', room: '204', status: 'offline', battery: 0, lastUpdate: '15m ago' },
    { id: 'C1', room: '108', status: 'online', battery: 78, lastUpdate: '1s ago' },
    { id: 'C2', room: '205', status: 'online', battery: 61, lastUpdate: '2s ago' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sensor Status</h3>
        <p className="text-slate-600 dark:text-slate-400">Real-time monitoring of all fall detection sensors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className={`bg-white dark:bg-slate-900 rounded-xl p-5 border-2 ${sensor.status === 'online'
                ? 'border-green-200 dark:border-green-900/30'
                : 'border-red-200 dark:border-red-900/30'
              }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${sensor.status === 'online'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    }`}
                >
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Sensor {sensor.id}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Room {sensor.room}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${sensor.status === 'online'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
              >
                {sensor.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Battery</span>
                  <span className="font-bold text-slate-900 dark:text-white">{sensor.battery}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${sensor.battery > 50
                        ? 'bg-green-500'
                        : sensor.battery > 20
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                    style={{ width: `${sensor.battery}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Last Update</span>
                <span className="font-semibold text-slate-900 dark:text-white">{sensor.lastUpdate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityLogsView() {
  type LogSeverity = 'critical' | 'warning' | 'info';

  interface ActivityLog {
    id: number;
    timestamp: string;
    room: string;
    patient: string;
    event: string;
    severity: LogSeverity;
  }

  const logs: ActivityLog[] = [
    {
      id: 1,
      timestamp: '2024-02-07 14:23:45',
      room: '302',
      patient: 'Martha Jenkins',
      event: 'Fall Detected',
      severity: 'critical',
    },
    {
      id: 2,
      timestamp: '2024-02-07 14:21:30',
      room: '204',
      patient: 'Sam Wilson',
      event: 'Bed Exit Detected',
      severity: 'warning',
    },
    {
      id: 3,
      timestamp: '2024-02-07 14:18:12',
      room: '105',
      patient: 'Alice Smith',
      event: 'Movement Detected',
      severity: 'info',
    },
    {
      id: 4,
      timestamp: '2024-02-07 14:15:05',
      room: '101',
      patient: 'John Doe',
      event: 'Normal Activity',
      severity: 'info',
    },
    {
      id: 5,
      timestamp: '2024-02-07 14:10:22',
      room: '302',
      patient: 'Martha Jenkins',
      event: 'Bathroom Trip Started',
      severity: 'warning',
    },
    {
      id: 6,
      timestamp: '2024-02-07 14:05:18',
      room: '204',
      patient: 'Sam Wilson',
      event: 'Returned to Bed',
      severity: 'info',
    },
  ];

  const severityConfig: Record<LogSeverity, { bg: string; border: string; text: string; badge: string }> = {
    critical: {
      bg: 'bg-red-50 dark:bg-red-900/10',
      border: 'border-red-200 dark:border-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      badge: 'bg-red-600 text-white',
    },
    warning: {
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      border: 'border-orange-200 dark:border-orange-900/30',
      text: 'text-orange-700 dark:text-orange-400',
      badge: 'bg-orange-600 text-white',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-200 dark:border-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      badge: 'bg-blue-600 text-white',
    },
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Activity Logs</h3>
        <p className="text-slate-600 dark:text-slate-400">Recent patient activity and system events</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className={`${severityConfig[log.severity].bg} hover:bg-opacity-80 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                    {log.room}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                    {log.patient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    {log.event}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${severityConfig[log.severity].badge}`}
                    >
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room }: { room: RoomData }) {
  const riskConfig = {
    low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'LOW RISK' },
    moderate: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'MODERATE' },
    high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'HIGH RISK' },
    critical: { bg: 'bg-red-600', text: 'text-white', label: 'CRITICAL' },
  };

  const activityConfig = {
    walking: { icon: 'directions_walk', color: 'text-blue-400', label: 'Steady Movement', showProgress: true },
    resting: { icon: 'bed', color: 'text-slate-400', label: 'In Bed - Resting', showProgress: false },
    bathroom: { icon: 'wc', color: 'text-orange-400', label: 'Bathroom Trip', showProgress: true },
    fallen: { icon: 'personal_injury', color: 'text-red-600', label: 'FALL DETECTED!', showProgress: false },
  };

  const isCritical = room.activityState === 'fallen';

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-slate-900 p-4 shadow-sm transition-shadow ${isCritical
        ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
        : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
        }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Room {room.roomNumber}</h4>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{room.patientName}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${riskConfig[room.riskLevel].bg} ${riskConfig[room.riskLevel].text}`}>
          {riskConfig[room.riskLevel].label}
        </span>
      </div>

      <div className="relative h-24 w-full rounded-lg bg-slate-100 dark:bg-slate-800 mb-3 overflow-hidden">
        {activityConfig[room.activityState].showProgress && (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_70%)]"></div>
        )}
        <div className="flex items-center justify-center h-full">
          <Activity className={`w-10 h-10 ${activityConfig[room.activityState].color}`} />
        </div>
        {activityConfig[room.activityState].showProgress && (
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 animate-pulse"
              style={{ width: `${room.activityProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p
          className={`text-xs font-medium ${isCritical ? 'text-red-600 font-bold' : 'text-slate-500 italic'
            }`}
        >
          {activityConfig[room.activityState].label}
        </p>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room.lastUpdate}</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  color: 'emerald' | 'blue' | 'purple';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
