/**
 * Activity Feed API - Recent system activity from reports and consultations
 * 
 * GET /api/activity?limit=20 - Get recent activity feed
 */

import { NextResponse } from 'next/server';
import { db, AIReport, Consultation } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ActivityItem {
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

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const activities: ActivityItem[] = [];

    // 1. Fetch AI Reports (alerts, detections)
    const { reports } = await db.getReports({ limit: 50 });
    
    reports.forEach((report: AIReport) => {
      let severity: ActivityItem['severity'] = 'info';
      let icon = 'activity';
      const type: ActivityItem['type'] = 'alert';

      if (report.alert_level === 'critical') {
        severity = 'critical';
        icon = 'alert-circle';
      } else if (report.alert_level === 'warning') {
        severity = 'warning';
        icon = 'alert-triangle';
      } else {
        severity = 'success';
        icon = 'check-circle';
      }

      const reportData = report.metadata || {};

      let title = `${report.module} Update`;
      let description = report.status || 'Status update';

      if (report.alert_level === 'critical') {
        title = `🚨 Critical Alert - Room ${report.room_id}`;
        description = (reportData && 'alert' in reportData && typeof reportData.alert === 'string' ? reportData.alert : null) || report.status || 'Critical condition detected';
      } else if (report.alert_level === 'warning') {
        title = `⚠️ Warning - Room ${report.room_id}`;
        description = (reportData && 'alert' in reportData && typeof reportData.alert === 'string' ? reportData.alert : null) || report.status || 'Attention required';
      } else {
        title = `✓ ${report.module} - Room ${report.room_id}`;
        description = report.status || 'Normal operation';
      }

      activities.push({
        id: `report-${report.id}`,
        type,
        severity,
        icon,
        title,
        description,
        timestamp: report.created_at || new Date().toISOString(),
        timeAgo: getTimeAgo(report.created_at || new Date().toISOString()),
        metadata: {
          roomId: report.room_id,
          patientId: report.patient_id,
          module: report.module,
          alertLevel: report.alert_level,
          confidence: report.confidence,
        },
      });
    });

    // 2. Fetch Consultations (video calls)
    try {
      const consultations = await db.getConsultations({ limit: 30 });
      
      consultations.forEach((consultation: Consultation) => {
        const isActive = consultation.status === 'active';

        activities.push({
          id: `consultation-${consultation.id}`,
          type: 'consultation',
          severity: isActive ? 'info' : 'success',
          icon: 'video',
          title: isActive 
            ? `📹 Video Consultation Active`
            : `✓ Consultation Completed`,
          description: `Room ${consultation.room_id} • ${consultation.doctor_name || 'Doctor'}`,
          timestamp: consultation.start_time,
          timeAgo: getTimeAgo(consultation.start_time),
          metadata: {
            roomId: consultation.room_id,
            patientId: consultation.patient_id,
            doctorId: consultation.doctor_id,
            doctorName: consultation.doctor_name,
            status: consultation.status,
          },
        });
      });
    } catch (err) {
      console.warn('[Activity API] Failed to fetch consultations:', err);
    }

    // 3. Sort by timestamp (most recent first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 4. Limit results
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: limitedActivities,
      total: activities.length,
      limit,
      success: true,
    });

  } catch (error) {
    console.error('[Activity API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch activity feed',
        activities: [],
        total: 0,
        success: false,
      },
      { status: 500 }
    );
  }
}
