/**
 * EdgeCare-5G useRooms Hook
 * Polls /api/rooms for real-time room updates
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RoomStatus } from '@/types';

interface UseRoomsReturn {
  rooms: RoomStatus[];
  loading: boolean;
  error: string | null;
  onlineCount: number;
  offlineCount: number;
  refetch: () => Promise<void>;
}

export function useRooms(pollInterval: number = 2000): UseRoomsReturn {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);

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
      // Don't throw error to allow polling to continue
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchRooms();

    // Setup polling
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
  };
}
