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
  Maximize2, Volume2, VolumeX, RefreshCw
} from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import type { RoomStatus } from '@/types';

export default function RoomMonitoringPage() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [muteAll, setMuteAll] = useState(false);
  const { rooms, loading, error, onlineCount, offlineCount, refetch } = useRooms(5000);

  const stableCount = rooms.filter(r => r.alertLevel === 'normal').length;
  const warningCount = rooms.filter(r => r.alertLevel === 'warning').length;
  const criticalCount = rooms.filter(r => r.alertLevel === 'critical').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading rooms...</p>
        </div>
      </div>
    );
  }

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
                Live patient monitoring • <span className="text-emerald-500 font-medium">{onlineCount} Online</span>
                {offlineCount > 0 && <span className="text-slate-400 ml-2">• {offlineCount} Offline</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Refresh</span>
            </button>

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
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Live • 5s</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Bed className="w-6 h-6" />} label="Total Rooms" value={rooms.length.toString()} color="blue" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Stable" value={stableCount.toString()} color="emerald" />
        <StatCard icon={<AlertCircle className="w-6 h-6" />} label="Warning" value={warningCount.toString()} color="amber" />
        <StatCard icon={<AlertCircle className="w-6 h-6" />} label="Critical" value={criticalCount.toString()} color="red" />
      </div>

      {error && (
        <div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Room Grid */}
      <div className="p-6 pt-0">
        {rooms.length === 0 ? (
          <div className="text-center py-20">
            <Monitor className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No rooms detected</h3>
            <p className="text-sm text-slate-500">Rooms will appear here when AI agents start sending reports</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.roomId}
                room={room}
                isSelected={selectedRoom === room.roomId}
                onClick={() => setSelectedRoom(room.roomId)}
                onExpand={() => {
                  if (room.patientId) {
                    router.push(`/patients/${room.patientId}`);
                  }
                }}
              />
            ))}
          </div>
        )}
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
  room: RoomStatus;
  isSelected: boolean;
  onClick: () => void;
  onExpand: () => void;
}) {
  const alertLevel = room.alertLevel as 'normal' | 'warning' | 'critical';
  const statusConfig = {
    normal: {
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

  const config = statusConfig[alertLevel] || statusConfig.normal;
  const confidence = Math.round(room.confidence * 100);
  const timeSince = room.lastSeen ? getTimeSince(room.lastSeen) : 'Unknown';

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border-2 ${config.bg} overflow-hidden transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      {/* Video Feed Placeholder */}
      <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="w-12 h-12 text-slate-400" />
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
          <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
          <span className="text-xs font-bold text-white">{room.roomId}</span>
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
        {room.online && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-white">LIVE</span>
          </div>
        )}
        {!room.online && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-xs font-bold text-white/70">OFFLINE</span>
          </div>
        )}
      </div>

      {/* Patient Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{room.patientName || 'No Patient'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {timeSince}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
            {alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1)}
          </span>
        </div>

        {/* Status & Confidence */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium">Status</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{room.status}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Wind className="w-4 h-4" />
              <span className="text-xs font-medium">AI Confidence</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{confidence}%</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl col-span-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Monitor className="w-4 h-4" />
              <span className="text-xs font-medium">Module</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{room.module}</p>
          </div>
        </div>

        {/* Alert for critical/warning */}
        {alertLevel === 'critical' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium text-red-700 dark:text-red-400">Critical Alert - Immediate Attention Required</span>
          </div>
        )}
        {alertLevel === 'warning' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Warning - Monitor Closely</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeSince(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

// End of file
