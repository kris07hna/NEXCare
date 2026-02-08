/**
 * useNotifications Hook
 * Fetch notifications from /api/notifications
 */

import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  roomId?: string;
  patientId?: string;
  acknowledged: boolean;
  createdAt: string;
}

export function useNotifications(intervalMs: number = 10000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error('[useNotifications] Error fetching:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [fetchNotifications, intervalMs]);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        // Refresh notifications after marking as read
        await fetchNotifications();
      }
    } catch (err) {
      console.error('[useNotifications] Error marking as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
  };
}
