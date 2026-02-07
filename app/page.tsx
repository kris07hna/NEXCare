/**
 * EdgeCare-5G AI Healthcare Dashboard
 * Main monitoring dashboard with live room feeds and AI activity
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { useRooms } from '@/hooks/useRooms';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Activity, Users, Bed, Shield, Search, Bell, Settings,
  Sun, Moon, Grid3X3, MonitorCheck, UserCircle, BarChart3,
  Video, AlertCircle, Clock, TrendingUp, Eye, Baby, HeartPulse,
  Calendar, Stethoscope, Server
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { rooms, loading, error, onlineCount, offlineCount, refetch } = useRooms(2000);
  const [filterView, setFilterView] = useState<'all' | 'critical'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDoctorMenu, setShowDoctorMenu] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const doctorMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (doctorMenuRef.current && !doctorMenuRef.current.contains(event.target as Node)) {
        setShowDoctorMenu(false);
      }
    };

    if (showNotifications || showDoctorMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showNotifications, showDoctorMenu]);

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications((prev) => !prev);
    setShowDoctorMenu(false);
  };

  const toggleDoctorMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDoctorMenu((prev) => !prev);
    setShowNotifications(false);
  };

  const handleStartConsultation = async (roomId: string, patientId: string | null) => {
    if (!patientId) {
      alert('No patient assigned to this room');
      return;
    }

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          patient_id: patientId,
          doctor_id: 'DOC001',
          doctor_name: 'Dr. Sarah Chen',
        }),
      });

      if (!response.ok) throw new Error('Failed to create consultation');
      const data = await response.json();
      router.push(`/consultation/${data.consultation.id}`);
    } catch (err) {
      console.error('Failed to start consultation:', err);
      alert('Failed to start consultation. Please try again.');
    }
  };

  const handleViewDetails = (roomId: string, patientId: string | null) => {
    // Navigate to patient details if patient is assigned, otherwise show alert
    if (patientId) {
      router.push(`/patients/${patientId}`);
    } else {
      alert('No patient assigned to this room');
    }
  };

  const criticalRooms = rooms.filter((r) => r.alertLevel === 'critical');
  const displayRooms = filterView === 'critical' ? criticalRooms : rooms;

  const activities = [
    {
      type: 'critical',
      icon: <AlertCircle className="w-4 h-4" />,
      title: 'Fall Alert',
      description: 'Room 5: Movement detected',
      detail: 'AI identified potential fall for Arthur Miller. Nurses dispatched.',
      time: '2 mins ago',
      color: 'red',
      actions: true,
    },
    {
      type: 'vitals',
      icon: <Activity className="w-4 h-4" />,
      title: 'Vitals Update',
      description: 'Room 12: Elena Vance',
      detail: 'Vitals stabilized. AI recommends transition to standard ward.',
      time: '14 mins ago',
      color: 'blue',
    },
    {
      type: 'consultation',
      icon: <Clock className="w-4 h-4" />,
      title: 'Video Call Confirmed',
      description: 'Patient #8821 with Dr. Smith scheduled at 2:00 PM.',
      detail: '',
      time: '45 mins ago',
      color: 'purple',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 transition-all">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-blue-600 rounded-full"></div>
            <Activity className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl tracking-tight leading-none">
              <span className="font-extrabold text-slate-900 dark:text-white">EdgeCare</span>
              <span className="font-light text-blue-600">-5G</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-1">Medical Identity</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink icon={<Grid3X3 className="w-5 h-5" />} label="Dashboard" active onClick={() => router.push('/')} />
          <NavLink icon={<Users className="w-5 h-5" />} label="Patients" onClick={() => router.push('/patients')} />
          <NavLink icon={<Video className="w-5 h-5" />} label="Consultations" onClick={() => router.push('/consultations')} />
          <NavLink icon={<BarChart3 className="w-5 h-5" />} label="AI Analytics" onClick={() => router.push('/analytics')} />
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Care Modules</p>
          </div>
          <NavLink icon={<MonitorCheck className="w-5 h-5" />} label="Room Monitoring" onClick={() => router.push('/room-monitoring')} />
          <NavLink icon={<Baby className="w-5 h-5" />} label="NeoCare" onClick={() => router.push('/neocare')} />
          <NavLink icon={<HeartPulse className="w-5 h-5" />} label="GeriCare" onClick={() => router.push('/gericare')} />
          <NavLink icon={<Stethoscope className="w-5 h-5" />} label="Diagnostics" onClick={() => router.push('/diagnostics')} />
          <NavLink icon={<Calendar className="w-5 h-5" />} label="Staff Schedule" onClick={() => router.push('/schedule')} />
        </nav>
        <div className="mt-auto pt-6 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <NavLink icon={<Settings className="w-5 h-5" />} label="Settings" onClick={() => router.push('/setup/servers')} />
          <div className="px-4 py-2">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <header className="sticky top-0 z-[100] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/20 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="md:hidden w-8 h-8 flex items-center justify-center border border-blue-600 rounded-full">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Main Dashboard</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                System Health: <span className="text-emerald-500 font-medium">Optimal 5G Latency (2ms)</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 relative z-[101]">
            <div className="relative">
              <input
                className="pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl w-64 focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                placeholder="Search patient ID..."
                type="text"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-2.5 bg-white dark:bg-slate-800 shadow-sm rounded-xl hover:scale-105 transition-transform"
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[9999]"
                >
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowNotifications(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <NotificationItem
                      type="critical"
                      title="Fall Alert - Room 5"
                      message="AI detected potential fall for Arthur Miller"
                      time="2 mins ago"
                    />
                    <NotificationItem
                      type="warning"
                      title="Vitals Alert - Room 12"
                      message="Heart rate elevated for Elena Vance"
                      time="15 mins ago"
                    />
                    <NotificationItem
                      type="info"
                      title="Consultation Scheduled"
                      message="Dr. Smith with Patient #8821 at 2:00 PM"
                      time="1 hour ago"
                    />
                  </div>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={doctorMenuRef}>
              <button
                onClick={toggleDoctorMenu}
                className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. Sarah Chen</p>
                  <p className="text-xs text-slate-500">Chief Officer</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 ring-2 ring-blue-600 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"></div>
              </button>

              {/* Doctor Menu Dropdown */}
              {showDoctorMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[9999]"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500"></div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. Sarah Chen</p>
                        <p className="text-xs text-slate-500">Chief Officer</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDoctorMenu(false);
                          router.push('/physician-hub');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <UserCircle className="w-4 h-4 inline mr-2" />
                        My Profile
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDoctorMenu(false);
                          router.push('/schedule');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        My Schedule
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDoctorMenu(false);
                          router.push('/setup/servers');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Settings
                      </button>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDoctorMenu(false);
                          router.push('/login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={<UserCircle className="w-6 h-6" />}
              label="Active Patients"
              value="128"
              trend="+12%"
              color="blue"
            />
            <StatCard
              icon={<Bed className="w-6 h-6" />}
              label="Available Beds"
              value="42"
              subtitle="of 170"
              color="purple"
            />
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              label="AI Diagnostic Confidence"
              value="99.8%"
              verified
              color="emerald"
            />
          </div>

          {/* Specialized Care Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <CareModuleCard
              title="NeoCare"
              description="Neonatal intensive care monitoring"
              icon={<Baby className="w-8 h-8" />}
              color="blue"
              onClick={() => router.push('/neocare')}
            />
            <CareModuleCard
              title="GeriCare"
              description="Fall detection & elderly care"
              icon={<HeartPulse className="w-8 h-8" />}
              color="purple"
              onClick={() => router.push('/gericare')}
            />
            <CareModuleCard
              title="Diagnostics"
              description="System health & analytics"
              icon={<Stethoscope className="w-8 h-8" />}
              color="emerald"
              onClick={() => router.push('/diagnostics')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">\n            {/* Live Room Monitoring */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Live Room Monitoring</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterView('all')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${
                      filterView === 'all'
                        ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    All Rooms
                  </button>
                  <button
                    onClick={() => setFilterView('critical')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${
                      filterView === 'critical'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Critical Only
                  </button>
                </div>
              </div>

              {loading && rooms.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <Activity className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-500">Loading rooms...</p>
                  </div>
                </div>
              ) : displayRooms.length === 0 ? (
                <div className="text-center py-16">
                  <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No rooms to display</h3>
                  <p className="text-sm text-slate-500">
                    {filterView === 'critical' ? 'No critical alerts at this time' : 'No rooms online'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayRooms.slice(0, 4).map((room) => (
                    <RoomMonitorCard
                      key={room.roomId}
                      room={room}
                      onViewDetails={() => handleViewDetails(room.roomId, room.patientId)}
                      onStartConsultation={() => handleStartConsultation(room.roomId, room.patientId)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AI Activity Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Activity Feed</h3>
                <button className="text-blue-600 text-sm font-semibold hover:underline">Clear</button>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 overflow-hidden relative">
                <div className="absolute left-10 top-10 bottom-10 w-px bg-slate-100 dark:bg-slate-700"></div>
                <div className="space-y-8 relative">
                  {activities.map((activity, idx) => (
                    <ActivityItem key={idx} {...activity} />
                  ))}
                </div>
                <button className="w-full mt-8 py-3 text-slate-400 text-xs font-bold border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all uppercase tracking-wider">
                  View All Activity
                </button>
              </div>

              {/* Premium Upgrade Card */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2">EdgeCare Ultra</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Enhance diagnostic precision with 4K streams and 5G low-latency overlays.
                  </p>
                  <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
                    Go Premium
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-colors"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
        active
          ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 font-semibold'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend, subtitle, verified, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  subtitle?: string;
  verified?: boolean;
  color?: 'blue' | 'purple' | 'emerald';
}) {
  const colorStyles = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-600',
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-600',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group">
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorStyles[color || 'blue']}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {trend && <span className="text-xs font-bold text-emerald-500">{trend}</span>}
          {verified && <Shield className="w-4 h-4 text-emerald-500" />}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function CareModuleCard({ title, description, icon, color, onClick }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'emerald';
  onClick: () => void;
}) {
  const colorStyles = {
    blue: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    purple: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    emerald: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
  };

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${colorStyles[color]} p-6 text-left text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1`}
    >
      <div className="relative z-10">
        <div className="mb-4 inline-block rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <span>Open Module</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
    </button>
  );
}

function RoomMonitorCard({ room, onViewDetails, onStartConsultation }: any) {
  const alertColors = {
    critical: 'ring-4 ring-red-500/50',
    warning: 'ring-2 ring-amber-500/50',
    normal: '',
  };

  const statusColors = {
    critical: 'bg-red-600',
    warning: 'bg-amber-500',
    normal: 'bg-violet-600',
  };

  const statusText = {
    critical: 'FALL ALERT',
    warning: 'RECOVERING',
    normal: 'STABLE',
  };

  return (
    <div
      className={`relative group rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 aspect-video shadow-lg cursor-pointer ${
        alertColors[room.alertLevel as keyof typeof alertColors]
      }`}
      onClick={onViewDetails}
    >
      <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute top-4 left-4 flex gap-2">
        <span className={`px-3 py-1 ${statusColors[room.alertLevel as keyof typeof statusColors]} text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg`}>
          {room.roomId} - {room.module}: {statusText[room.alertLevel as keyof typeof statusText]}
        </span>
        <span className="px-2 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> 5G Live
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
        <div>
          <p className="text-xs font-medium opacity-80">Patient</p>
          <p className="font-bold">{room.patientName || 'Unassigned'}</p>
        </div>
        <div className="text-right">
          {room.alertLevel === 'critical' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartConsultation();
              }}
              className="bg-white text-red-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-50 transition-colors"
            >
              Emergency Call
            </button>
          ) : (
            <div>
              <p className="text-xs font-medium opacity-80">Confidence</p>
              <p className="font-bold">{Math.round(room.confidence * 100)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ type, icon, title, description, detail, time, color, actions }: any) {
  const colorClasses = {
    red: 'bg-red-100 dark:bg-red-900/30 text-red-500',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    purple: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
  };

  return (
    <div className="flex gap-4 relative">
      <div className={`w-8 h-8 rounded-full ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center z-10 shrink-0 border-4 border-white dark:border-slate-800`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-bold uppercase ${color === 'red' ? 'text-red-500' : color === 'blue' ? 'text-blue-600' : 'text-violet-600'}`}>
            {title}
          </span>
          <span className="text-[10px] text-slate-400">{time}</span>
        </div>
        <p className="text-sm font-semibold mb-1 text-slate-900 dark:text-white">{description}</p>
        {detail && <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>}
        {actions && (
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              DISMISS
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors">
              VIEW FEED
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ type, title, message, time }: {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
}) {
  const typeStyles = {
    critical: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500',
    warning: 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500',
  };

  const iconStyles = {
    critical: 'text-red-500',
    warning: 'text-orange-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 mt-0.5 ${iconStyles[type]}`} />
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{message}</p>
          <p className="text-xs text-slate-400">{time}</p>
        </div>
      </div>
    </div>
  );
}
