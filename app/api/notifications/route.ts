/**
 * Notifications API - Fetch critical/warning alerts from AI reports
 * 
 * GET /api/notifications - Get unacknowledged notifications
 * PUT /api/notifications - Mark notifications as read
 */

import { NextResponse } from 'next/server';
import { db, AIReport } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Notification {
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

export async function GET() {
  try {
    // Fetch recent critical and warning alerts from ai_reports
    const { reports } = await db.getReports({ limit: 50 });

    const notifications: Notification[] = reports
      .filter((report: AIReport) => 
        report.alert_level === 'critical' || 
        report.alert_level === 'warning' ||
        (report.metadata && typeof report.metadata === 'object' && 'alert' in report.metadata)
      )
      .map((report: AIReport) => {
        const reportData = report.metadata || {};

        // Determine notification type
        let type: 'critical' | 'warning' | 'info' = 'info';
        if (report.alert_level === 'critical') type = 'critical';
        else if (report.alert_level === 'warning') type = 'warning';

        // Create notification title and message
        let title = `${report.module} Alert`;
        let message = report.status || 'No details available';

        // Extract specific alert information
        if (reportData) {
          if ('alert' in reportData && typeof reportData.alert === 'string') {
            message = reportData.alert;
          } else if ('detection' in reportData && typeof reportData.detection === 'string') {
            message = `${reportData.detection} detected`;
          }
          
          // Add patient context
          if (report.patient_id) {
            title = `Alert - Room ${report.room_id || 'Unknown'}`;
          }
        }

        // Calculate relative time
        const now = new Date();
        const created = new Date(report.created_at || new Date().toISOString());
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeAgo: string;
        if (diffMins < 1) timeAgo = 'Just now';
        else if (diffMins < 60) timeAgo = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return {
          id: String(report.id),
          type,
          title,
          message,
          time: timeAgo,
          roomId: report.room_id,
          patientId: report.patient_id || undefined,
          acknowledged: false, // TODO: Track in database
          createdAt: report.created_at || new Date().toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10); // Return only 10 most recent

    // Count unacknowledged notifications
    const unreadCount = notifications.filter(n => !n.acknowledged).length;

    return NextResponse.json({
      notifications,
      unreadCount,
      success: true,
    });

  } catch (error) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch notifications',
        notifications: [],
        unreadCount: 0,
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Mark notification(s) as acknowledged/read
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { notificationIds } = body; // Array of notification IDs to mark as read

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid request: notificationIds array required' },
        { status: 400 }
      );
    }

    // TODO: When you add 'acknowledged' column to ai_reports table, update here
    // For now, just return success
    // Example Supabase update:
    // await supabase
    //   .from('ai_reports')
    //   .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
    //   .in('id', notificationIds);

    return NextResponse.json({
      success: true,
      acknowledgedCount: notificationIds.length,
    });

  } catch (error) {
    console.error('[Notifications API] Error marking as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read', success: false },
      { status: 500 }
    );
  }
}
