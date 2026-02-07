/**
 * Connection Status Component - Premium connection indicator
 */

'use client';

import { WifiOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { ConnectionState } from '@/types';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
}

export function ConnectionStatus({ connectionState, connectionQuality }: ConnectionStatusProps) {
  const getStateInfo = (): { text: string; color: string; dotColor: string } => {
    switch (connectionState) {
      case 'idle':
        return { text: 'Not connected', color: 'text-slate-400 bg-slate-800/80', dotColor: 'bg-slate-500' };
      case 'initializing':
        return { text: 'Initializing...', color: 'text-indigo-300 bg-indigo-500/10', dotColor: 'bg-indigo-400' };
      case 'connecting':
        return { text: 'Connecting...', color: 'text-indigo-300 bg-indigo-500/10', dotColor: 'bg-indigo-400' };
      case 'connected': {
        const qc = getQualityStyle(connectionQuality);
        return { text: 'Secure 5G', ...qc };
      }
      case 'reconnecting':
        return { text: 'Reconnecting...', color: 'text-amber-300 bg-amber-500/10', dotColor: 'bg-amber-400' };
      case 'disconnected':
        return { text: 'Disconnected', color: 'text-slate-400 bg-slate-800/80', dotColor: 'bg-slate-500' };
      case 'failed':
        return { text: 'Failed', color: 'text-red-300 bg-red-500/10', dotColor: 'bg-red-400' };
      default:
        return { text: 'Unknown', color: 'text-slate-400 bg-slate-800/80', dotColor: 'bg-slate-500' };
    }
  };

  const getQualityStyle = (quality: string | null) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return { color: 'text-emerald-300 bg-emerald-500/10', dotColor: 'bg-emerald-400' };
      case 'fair':
        return { color: 'text-amber-300 bg-amber-500/10', dotColor: 'bg-amber-400' };
      case 'poor':
        return { color: 'text-red-300 bg-red-500/10', dotColor: 'bg-red-400' };
      default:
        return { color: 'text-indigo-300 bg-indigo-500/10', dotColor: 'bg-indigo-400' };
    }
  };

  const { text, color, dotColor } = getStateInfo();
  const isLoading = ['initializing', 'connecting', 'reconnecting'].includes(connectionState);

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold backdrop-blur-sm border border-white/5 ${color}`}>
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${dotColor}`} />
      )}
      <span>{text}</span>
    </div>
  );
}
