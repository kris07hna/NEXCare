/**
 * Reports API Route
 * POST /api/reports - Create new AI report (used by AI agents)
 * GET /api/reports - Get AI reports with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { createReportSchema, getReportsQuerySchema } from '@/lib/validation';
import { roomRegistry } from '@/lib/room-registry';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await db.initialize();

    const body = await request.json();

    // Validate request body
    const validatedData = createReportSchema.parse(body);

    // Convert arrays to JSON strings for storage
    const reportData = {
      roomId: validatedData.room_id,
      patientId: validatedData.patient_id,
      module: validatedData.module,
      status: validatedData.status,
      confidence: validatedData.confidence,
      timestamp: validatedData.timestamp,
      predictions: validatedData.predictions ? JSON.stringify(validatedData.predictions) : undefined,
      bbox: validatedData.bbox ? JSON.stringify(validatedData.bbox) : undefined,
      alertLevel: validatedData.alert_level,
      alertCount: validatedData.alert_count,
      personIds: validatedData.person_ids ? JSON.stringify(validatedData.person_ids) : undefined,
      metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : undefined,
    };

    // Create report in database
    const report = await db.createReport(reportData);

    // Update room registry for real-time status
    roomRegistry.updateRoom({
      room_id: validatedData.room_id,
      module: validatedData.module,
      status: validatedData.status,
      confidence: validatedData.confidence,
      timestamp: validatedData.timestamp,
      latest_report: report,
    });

    console.log(
      `[API /reports POST] ✓ Report created: ${validatedData.module} - ${validatedData.room_id} - ${validatedData.status}`
    );

    return NextResponse.json(
      {
        success: true,
        report_id: report.reportId,
        created_at: report.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /reports POST] Error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await db.initialize();

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      room_id: searchParams.get('room_id') || undefined,
      patient_id: searchParams.get('patient_id') || undefined,
      module: searchParams.get('module') || undefined,
      alert_level: searchParams.get('alert_level') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    const validatedQuery = getReportsQuerySchema.parse(queryParams);

    // Get reports from database
    const { reports, total } = await db.getReports({
      roomId: validatedQuery.room_id,
      patientId: validatedQuery.patient_id,
      module: validatedQuery.module as ('NeoCare-AI' | 'GeriCare-AI') | undefined,
      alertLevel: validatedQuery.alert_level,
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
    });

    const hasMore = validatedQuery.offset + validatedQuery.limit < total;

    return NextResponse.json({
      reports,
      count: reports.length,
      total,
      has_more: hasMore,
    });
  } catch (error) {
    console.error('[API /reports GET] Error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch reports',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
