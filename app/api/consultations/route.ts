/**
 * Consultations API Route
 * POST /api/consultations - Create new consultation session
 * GET /api/consultations - Get all consultations
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { createConsultationSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await db.initialize();

    const body = await request.json();
    const validatedData = createConsultationSchema.parse(body);

    const consultation = await db.createConsultation({
      room_id: validatedData.room_id,
      patient_id: validatedData.patient_id,
      doctor_id: validatedData.doctor_id,
      doctor_name: validatedData.doctor_name,
      start_time: new Date().toISOString(),
      status: 'active',
    });

    console.log(
      `[API /consultations POST] ✓ Consultation created: ${consultation.session_id} - Room ${validatedData.room_id}`
    );

    return NextResponse.json(
      {
        success: true,
        session_id: consultation.session_id,
        consultation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /consultations POST] Error:', error);

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
        error: 'Failed to create consultation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await db.initialize();

    // For now, we'll return active consultations
    // In production, you'd add filters and pagination
    const { reports } = await db.getReports({ limit: 100 });

    // This is a simplified version - in production, query consultation_sessions table
    return NextResponse.json({
      consultations: [],
      count: 0,
    });
  } catch (error) {
    console.error('[API /consultations GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch consultations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
