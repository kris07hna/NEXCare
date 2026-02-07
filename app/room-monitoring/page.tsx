/**
 * Room Monitoring - Live Patient Monitoring System
 * Real-time monitoring of all patient rooms with video feeds and vitals
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, Monitor, Heart, Droplets, Wind, Thermometer,
  AlertCircle, CheckCircle, Video, Bed, Clock,
  Maximize2, Volume2, VolumeX
} from 'lucide-react';

interface RoomData {
  id: string;
  roomNumber: string;
  patientName: string;
  status: 'stable' | 'warning' | 'critical';
  heartRate: number;
  bloodPressure: string;
  oxygen: number;
  temperature: number;
  lastUpdate: string;
  hasVideo: boolean;
  alerts: string[];
}

export default function RoomMonitoringPage() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [muteAll, setMuteAll] = useState(false);

  const rooms: RoomData[] = [
    {
      id: '1',
      roomNumber: 'ICU-101',
      patientName: 'Sarah Miller',
      status: 'stable',
      heartRate: 72,
      bloodPressure: '120/80',
      oxygen: 98,
      temperature: 36.8,
      lastUpdate: '30 sec ago',
      hasVideo: true,
      alerts: []
    },
    {
      id: '2',
      roomNumber: 'ICU-102',
      patientName: 'James Wilson',
      status: 'critical',
      heartRate: 145,
      bloodPressure: '165/95',
      oxygen: 89,
      temperature: 38.2,
      lastUpdate: '5 sec ago',
      hasVideo: true,
      alerts: ['High Heart Rate', 'Low O2', 'Elevated BP']
    },
    {
      id: '3',
      roomNumber: 'ICU-103',
      patientName: 'Emma Davis',
      status: 'warning',
      heartRate: 110,
      bloodPressure: '140/85',
      oxygen: 93,
      temperature: 37.5,
      lastUpdate: '15 sec ago',
      hasVideo: true,
      alerts: ['Elevated Heart Rate']
    },
    {
      id: '4',
      roomNumber: 'ICU-104',
      patientName: 'Michael Brown',
      status: 'stable',
      heartRate: 68,
      bloodPressure: '115/75',
      oxygen: 99,
      temperature: 36.6,
      lastUpdate: '20 sec ago',
      hasVideo: true,
      alerts: []
    },
    {
      id: '5',
      roomNumber: 'ICU-105',
      patientName: 'Lisa Anderson',
      status: 'stable',
      heartRate: 75,
      bloodPressure: '118/78',
      oxygen: 97,
      temperature: 36.9,
      lastUpdate: '45 sec ago',
      hasVideo: true,
      alerts: []
    },
    {
      id: '6',
      roomNumber: 'ICU-106',
      patientName: 'David Martinez',
      status: 'warning',
      heartRate: 105,
      bloodPressure: '135/88',
      oxygen: 94,
      temperature: 37.2,
      lastUpdate: '10 sec ago',
      hasVideo: true,
      alerts: ['Elevated Temp']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Monitor className="w-7 h-7 text-blue-600" />
                Room Monitoring
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Live patient monitoring • <span className="text-emerald-500 font-medium">{rooms.length} Active Rooms</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setMuteAll(!muteAll)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {muteAll ? (
                <VolumeX className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {muteAll ? 'Unmute All' : 'Mute All'}
              </span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Bed className="w-6 h-6" />}
          label="Total Rooms"
          value={rooms.length.toString()}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Stable"
          value={rooms.filter(r => r.status === 'stable').length.toString()}
          color="emerald"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="Warning"
          value={rooms.filter(r => r.status === 'warning').length.toString()}
          color="amber"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="Critical"
          value={rooms.filter(r => r.status === 'critical').length.toString()}
          color="red"
        />
      </div>

      {/* Room Grid */}
      <div className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isSelected={selectedRoom === room.id}
              onClick={() => setSelectedRoom(room.id)}
              onExpand={() => router.push(`/patients/${room.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'amber' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function RoomCard({ room, isSelected, onClick, onExpand }: {
  room: RoomData;
  isSelected: boolean;
  onClick: () => void;
  onExpand: () => void;
}) {
  const statusConfig = {
    stable: {
      bg: 'border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500'
    },
    warning: {
      bg: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500'
    },
    critical: {
      bg: 'border-red-200 dark:border-red-800 ring-2 ring-red-500/20',
      badge: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
      dot: 'bg-red-500 animate-pulse'
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border-2 ${statusConfig[room.status].bg} overflow-hidden transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      {/* Video Feed */}
      <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="w-12 h-12 text-slate-400" />
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
          <div className={`w-2 h-2 rounded-full ${statusConfig[room.status].dot}`}></div>
          <span className="text-xs font-bold text-white">{room.roomNumber}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-black/80 transition-colors"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-white">LIVE</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{room.patientName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {room.lastUpdate}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[room.status].badge}`}>
            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </span>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <VitalMini
            icon={<Heart className="w-4 h-4" />}
            label="HR"
            value={room.heartRate.toString()}
            unit="bpm"
            status={room.heartRate > 100 ? 'warning' : 'normal'}
          />
          <VitalMini
            icon={<Wind className="w-4 h-4" />}
            label="SpO2"
            value={room.oxygen.toString()}
            unit="%"
            status={room.oxygen < 92 ? 'critical' : room.oxygen < 95 ? 'warning' : 'normal'}
          />
          <VitalMini
            icon={<Droplets className="w-4 h-4" />}
            label="BP"
            value={room.bloodPressure}
            unit=""
            status="normal"
          />
          <VitalMini
            icon={<Thermometer className="w-4 h-4" />}
            label="Temp"
            value={room.temperature.toString()}
            unit="°C"
            status={room.temperature > 37.5 ? 'warning' : 'normal'}
          />
        </div>

        {/* Alerts */}
        {room.alerts.length > 0 && (
          <div className="space-y-2">
            {room.alerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">{alert}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VitalMini({ icon, label, value, unit, status }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}) {
  const statusColors = {
    normal: 'text-slate-900 dark:text-white',
    warning: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-600 dark:text-red-400'
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${statusColors[status]}`}>
        {value}<span className="text-xs ml-1">{unit}</span>
      </p>
    </div>
  );
}
