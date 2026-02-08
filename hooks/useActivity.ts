/**
 * useActivity Hook
 * Fetch activity feed from /api/activity
 */

import { useState, useEffect, useCallback } from 'react';

export interface Activity {
  id: string;
  type: 'alert' | 'consultation' | 'patient' | 'system';
  severity: 'critical' | 'warning' | 'info' | 'success';
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  metadata?: {
    roomId?: string;
    patientId?: string;
    module?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export function useActivity(limit: number = 20, intervalMs: number = 10000) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/activity?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.activities || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      console.error('[useActivity] Error fetching:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
    
    const interval = setInterval(() => {
      fetchActivities();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [fetchActivities, intervalMs]);

  return {
    activities,
    total,
    loading,
    error,
    refresh: fetchActivities,
  };
}
