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

    // Convert arrays to JSON strings for storage
    const patientData: any = {
      fullName: validatedData.full_name,
      age: validatedData.age,
      gender: validatedData.gender,
      roomId: validatedData.room_id,
      admissionDate: validatedData.admission_date || new Date().toISOString(),
      contactNumber: validatedData.contact_number,
      emergencyContact: validatedData.emergency_contact,
      emergencyPhone: validatedData.emergency_phone,
      bloodType: validatedData.blood_type,
      doctorAssigned: validatedData.doctor_assigned,
      notes: validatedData.notes,
      allergies: validatedData.allergies ? JSON.stringify(validatedData.allergies) : undefined,
      currentMedications: validatedData.current_medications
        ? JSON.stringify(validatedData.current_medications)
        : undefined,
      medicalConditions: validatedData.medical_conditions
        ? JSON.stringify(validatedData.medical_conditions)
        : undefined,
    };

    const patient = await db.createPatient(patientData);

    console.log(`[API /patients POST] ✓ Patient created: ${patient.patientId} - ${patient.fullName}`);

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
