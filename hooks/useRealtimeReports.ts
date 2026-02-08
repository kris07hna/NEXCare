/**
 * Real-Time Supabase Hook
 * Subscribes to live AI reports from edge nodes
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

interface UseRealtimeReportsOptions {
  roomId?: string;
  enabled?: boolean;
}

interface RealtimeReport {
  id: number;
  room_id: string;
  patient_id?: string;
  module: string;
  status: string;
  confidence: number;
  timestamp: number;
  alert_level: string;
  metadata?: Record<string, unknown>;
  edge_node_id?: string;
  created_at: string;
}

export function useRealtimeReports(options: UseRealtimeReportsOptions = {}) {
  const { roomId, enabled = true } = options;
  const [latestReport, setLatestReport] = useState<RealtimeReport | null>(null);
  const [reports, setReports] = useState<RealtimeReport[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Real-Time] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Channel configuration
    const channelName = roomId ? `room-${roomId}` : 'all-reports';
    const channel = supabase.channel(channelName);

    // Subscribe to INSERT events on ai_reports table
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_reports',
          ...(roomId && { filter: `room_id=eq.${roomId}` }),
        },
        (payload) => {
          const newReport = payload.new as RealtimeReport;
          console.log(`[5G MEC Real-Time] 📡 New ${newReport.module} report from ${newReport.room_id}:`, newReport.status);
          
          setLatestReport(newReport);
          setReports((prev) => [newReport, ...prev.slice(0, 99)]); // Keep last 100
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log(`[5G MEC Real-Time] ✓ Connected to ${channelName}`);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          console.log(`[5G MEC Real-Time] Disconnected from ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Subscription error');
          console.error(`[5G MEC Real-Time] Error on ${channelName}`);
        }
      });

    // Cleanup
    return () => {
      console.log(`[5G MEC Real-Time] Unsubscribing from ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [roomId, enabled]);

  const clearReports = useCallback(() => {
    setReports([]);
    setLatestReport(null);
  }, []);

  return {
    latestReport,
    reports,
    isConnected,
    error,
    clearReports,
  };
}

/**
 * Hook for real-time room status updates
 */
interface RoomStatusData {
  room_id: string;
  patient_id?: string;
  status: string;
  [key: string]: unknown;
}

export function useRealtimeRoomStatus() {
  const [roomUpdates, setRoomUpdates] = useState<Map<string, RoomStatusData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Real-Time Room Status] Missing Supabase credentials');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const channel = supabase
      .channel('room-status-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'room_status',
        },
        (payload) => {
          const roomData = payload.new as RoomStatusData | undefined;
          if (roomData && roomData.room_id) {
            console.log(`[5G MEC Real-Time] Room ${roomData.room_id} updated`);
            setRoomUpdates((prev) => {
              const updated = new Map(prev);
              updated.set(roomData.room_id, roomData);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('[5G MEC Real-Time] ✓ Connected to room status updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { roomUpdates, isConnected };
}

/**
 * Hook for edge node connectivity monitoring
 */
interface EdgeNodeData {
  node_id: string;
  online: boolean;
  node_type?: string;
  [key: string]: unknown;
}

export function useRealtimeEdgeNodes() {
  const [edgeNodes, setEdgeNodes] = useState<Map<string, EdgeNodeData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const channel = supabase
      .channel('edge-nodes-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'edge_nodes',
        },
        (payload) => {
          const nodeData = (payload.new || payload.old) as EdgeNodeData | undefined;
          if (nodeData && nodeData.node_id) {
            console.log(`[5G MEC Real-Time] Edge node ${nodeData.node_id} ${nodeData.online ? 'online' : 'offline'}`);
            setEdgeNodes((prev) => {
              const updated = new Map(prev);
              if (payload.eventType === 'DELETE') {
                updated.delete(nodeData.node_id);
              } else {
                updated.set(nodeData.node_id, nodeData);
              }
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('[5G MEC Real-Time] ✓ Connected to edge node monitoring');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { edgeNodes, isConnected };
}
