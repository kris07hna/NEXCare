/**
 * Patients API Route
 * GET /api/patients - Get all patients with filters
 * POST /api/patients - Create new patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { createPatientSchema, getPatientsQuerySchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    await db.initialize();

    const { searchParams } = new URL(request.url);

    const queryParams = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    const validatedQuery = getPatientsQuerySchema.parse(queryParams);

    const patients = await db.getPatients({
      status: validatedQuery.status,
      search: validatedQuery.search,
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
    });

    return NextResponse.json({
      patients,
      count: patients.length,
    });
  } catch (error) {
    console.error('[API /patients GET] Error:', error);

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
        error: 'Failed to fetch patients',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await db.initialize();

    const body = await request.json();

    const validatedData = createPatientSchema.parse(body);

    // Use snake_case keys matching the database schema
    const patientData: Partial<import('@/lib/database').Patient> & Record<string, unknown> = {
      full_name: validatedData.full_name,
      age: validatedData.age,
      gender: validatedData.gender,
      room_id: validatedData.room_id,
      admission_date: validatedData.admission_date || new Date().toISOString(),
      blood_type: validatedData.blood_type,
    };

    const patient = await db.createPatient(patientData);

    console.log(`[API /patients POST] ✓ Patient created: ${patient.patient_id} - ${patient.full_name}`);

    return NextResponse.json(
      {
        success: true,
        patient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /patients POST] Error:', error);

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
        error: 'Failed to create patient',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
