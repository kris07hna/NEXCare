/**
 * Patient Detail API Route
 * GET /api/patients/[id] - Get patient by ID
 * PUT /api/patients/[id] - Update patient
 * DELETE /api/patients/[id] - Delete patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { updatePatientSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await db.initialize();

    const patient = await db.getPatientById(id);

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error(`[API /patients/${id} GET] Error:`, error);
    return NextResponse.json(
      {
        error: 'Failed to fetch patient',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await db.initialize();

    const body = await request.json();
    const validatedData = updatePatientSchema.parse(body);

    // Convert arrays to JSON strings if present
    const updateData: any = { ...validatedData };

    if (validatedData.allergies) {
      updateData.allergies = JSON.stringify(validatedData.allergies);
    }
    if (validatedData.current_medications) {
      updateData.currentMedications = JSON.stringify(validatedData.current_medications);
    }
    if (validatedData.medical_conditions) {
      updateData.medicalConditions = JSON.stringify(validatedData.medical_conditions);
    }

    const patient = await db.updatePatient(id, updateData);

    console.log(`[API /patients/${id} PUT] ✓ Patient updated: ${patient.patient_id}`);

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error(`[API /patients/${id} PUT] Error:`, error);

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
        error: 'Failed to update patient',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await db.initialize();

    const success = await db.deletePatient(id);

    if (!success) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    console.log(`[API /patients/${id} DELETE] ✓ Patient deleted`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[API /patients/${id} DELETE] Error:`, error);
    return NextResponse.json(
      {
        error: 'Failed to delete patient',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
