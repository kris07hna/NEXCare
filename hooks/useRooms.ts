/**
 * EdgeCare-5G useRooms Hook
 * Real-time room updates via Supabase subscriptions + periodic refresh
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { RoomStatus } from '@/types';

interface UseRoomsReturn {
  rooms: RoomStatus[];
  loading: boolean;
  error: string | null;
  onlineCount: number;
  offlineCount: number;
  refetch: () => Promise<void>;
  isRealtimeConnected: boolean;
}

export function useRooms(pollInterval: number = 5000): UseRoomsReturn {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch('/api/rooms');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setRooms(data.rooms || []);
      setOnlineCount(data.online || 0);
      setOfflineCount(data.offline || 0);
      setError(null);
    } catch (err) {
      console.error('[useRooms] Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time subscription for instant updates
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[useRooms] Real-time disabled: Missing Supabase credentials');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Subscribe to ai_reports for instant room updates
    const channel = supabase
      .channel('room-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_reports',
        },
        (payload) => {
          console.log('[5G MEC Real-Time] 📡 New report received, refreshing rooms...');
          fetchRooms(); // Refresh room data when new report comes in
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('[5G MEC Real-Time] ✓ Room updates subscription active');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRooms]);

  // Periodic refresh as backup
  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, pollInterval);
    return () => clearInterval(interval);
  }, [fetchRooms, pollInterval]);

  return {
    rooms,
    loading,
    error,
    onlineCount,
    offlineCount,
    refetch: fetchRooms,
    isRealtimeConnected,
  };
}
