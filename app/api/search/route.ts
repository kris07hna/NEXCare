/**
 * Search API - Search across patients, rooms, and reports
 * 
 * GET /api/search?q=<query> - Search for patients, rooms, and recent reports
 */

import { NextResponse } from 'next/server';
import { db, Patient, AIReport } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchResult {
  type: 'patient' | 'room' | 'report';
  id: string;
  title: string;
  subtitle: string;
  link: string;
  icon?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        results: [],
        count: 0,
        query: '',
      });
    }

    const searchTerm = query.trim().toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Patients
    const patients = await db.getPatients();
    const matchingPatients = patients.filter((patient: Patient) => {
      const nameMatch = patient.full_name?.toLowerCase().includes(searchTerm);
      const idMatch = patient.id?.toLowerCase().includes(searchTerm);
      const medicalIdMatch = patient.patient_id?.toLowerCase().includes(searchTerm);
      return nameMatch || idMatch || medicalIdMatch;
    });

    matchingPatients.forEach((patient: Patient) => {
      results.push({
        type: 'patient',
        id: patient.id,
        title: patient.full_name || 'Unnamed Patient',
        subtitle: `Patient ID: ${patient.patient_id || patient.id}`,
        link: `/patients/${patient.id}`,
        icon: 'user',
        metadata: {
          status: patient.status,
          admissionDate: patient.admission_date,
        },
      });
    });

    // 2. Search Reports (by room, status, module)
    const { reports } = await db.getReports({ limit: 100 });
    const matchingReports = reports.filter((report: AIReport) => {
      const roomMatch = report.room_id?.toLowerCase().includes(searchTerm);
      const statusMatch = report.status?.toLowerCase().includes(searchTerm);
      const moduleMatch = report.module?.toLowerCase().includes(searchTerm);
      const patientMatch = report.patient_id?.toLowerCase().includes(searchTerm);
      return roomMatch || statusMatch || moduleMatch || patientMatch;
    });

    // Group reports by room (show rooms with recent activity)
    const roomMap = new Map<string, AIReport[]>();
    matchingReports.forEach((report: AIReport) => {
      if (report.room_id) {
        if (!roomMap.has(report.room_id)) {
          roomMap.set(report.room_id, []);
        }
        roomMap.get(report.room_id)!.push(report);
      }
    });

    // Add unique rooms to results
    roomMap.forEach((roomReports, roomId) => {
      const latestReport = roomReports[0]; // Most recent
      const criticalCount = roomReports.filter((r: AIReport) => r.alert_level === 'critical').length;
      
      results.push({
        type: 'room',
        id: roomId,
        title: `Room ${roomId}`,
        subtitle: `${roomReports.length} report${roomReports.length > 1 ? 's' : ''} • ${latestReport.module}`,
        link: `/room-monitoring?room=${roomId}`,
        icon: 'monitor',
        metadata: {
          reportCount: roomReports.length,
          criticalAlerts: criticalCount,
          module: latestReport.module,
          lastUpdate: latestReport.created_at || null,
        },
      });
    });

    // 3. Add recent critical reports as individual results (max 5)
    const criticalReports = reports
      .filter((r: AIReport) => r.alert_level === 'critical')
      .slice(0, 5);

    criticalReports.forEach((report: AIReport) => {
      if (!results.some(r => r.type === 'room' && r.id === report.room_id)) {
        results.push({
          type: 'report',
          id: String(report.id),
          title: `Critical Alert - ${report.room_id}`,
          subtitle: report.status || 'Critical condition detected',
          link: `/neocare?report=${report.id}`,
          icon: 'alert-circle',
          metadata: {
            alertLevel: report.alert_level,
            module: report.module,
            createdAt: report.created_at || null,
          },
        });
      }
    });

    // Sort results: patients first, then rooms, then reports
    results.sort((a, b) => {
      const order = { patient: 0, room: 1, report: 2 };
      return order[a.type] - order[b.type];
    });

    return NextResponse.json({
      results: results.slice(0, 20), // Limit to 20 results
      count: results.length,
      query: searchTerm,
      success: true,
    });

  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        results: [],
        count: 0,
        success: false,
      },
      { status: 500 }
    );
  }
}
