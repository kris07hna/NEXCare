/**
 * EdgeCare-5G Room Card Component - Premium Design
 * Displays real-time room status with polished UI
 */

'use client';

import { Video, User, Activity, ArrowUpRight, Clock } from 'lucide-react';
import { getModuleEmoji, getStatusColor, getAlertBadgeColor } from '@/lib/utils';
import type { RoomCardProps } from '@/types';

export function RoomCard({
  roomId,
  patientName,
  module,
  status,
  confidence,
  alertLevel,
  online,
  lastSeen,
  onStartConsultation,
  onViewDetails,
}: RoomCardProps) {
  const emoji = getModuleEmoji(module);
  const statusColorClass = getStatusColor(status);

  const alertStyles = {
    normal: {
      badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
      border: 'border-slate-100',
      glow: '',
    },
    warning: {
      badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
      border: 'border-amber-200',
      glow: 'shadow-amber-100/50',
    },
    critical: {
      badge: 'bg-red-100 text-red-700 ring-1 ring-red-200',
      border: 'border-red-200',
      glow: 'shadow-red-100/50',
    },
  };

  const styles = alertStyles[alertLevel] || alertStyles.normal;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${styles.border} ${styles.glow}`}
    >
      {/* Top Row: Online Status + Alert Badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className={`relative flex h-2.5 w-2.5 ${online ? '' : ''}`}>
            {online ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-300" />
            )}
          </span>
          <span className={`text-xs font-medium ${online ? 'text-emerald-600' : 'text-slate-400'}`}>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles.badge}`}>
          {alertLevel}
        </span>
      </div>

      {/* Room Header */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{roomId}</h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          {patientName ? (
            <>
              <User className="h-3.5 w-3.5" />
              <span className="font-medium text-slate-700">{patientName}</span>
            </>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          )}
        </div>
      </div>

      {/* Module Tag */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-semibold text-slate-700">{module}</span>
      </div>

      {/* Status Display */}
      <div className="mb-4">
        <p className={`text-2xl font-bold ${statusColorClass}`}>{status}</p>
        <div className="mt-2 flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">
            {(confidence * 100).toFixed(1)}% confidence
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700 ease-out"
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Last Seen */}
      <div className="mb-5 flex items-center gap-1.5 text-xs text-slate-400">
        <Clock className="h-3 w-3" />
        {new Date(lastSeen).toLocaleTimeString()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onStartConsultation}
          disabled={!online}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md hover:shadow-indigo-500/30 active:scale-[0.98] disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <Video className="h-4 w-4" />
          Consult
        </button>
        <button
          onClick={onViewDetails}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
        >
          Details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/2 to-cyan-500/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
