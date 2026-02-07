/**
 * End Consultation API Route
 * PATCH /api/consultations/[id]/end - End consultation session
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { endConsultationSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await db.initialize();

    const body = await request.json();
    const validatedData = endConsultationSchema.parse(body);

    const consultation = await db.endConsultation(id, validatedData.notes);

    console.log(`[API /consultations/${id}/end PATCH] ✓ Consultation ended: ${consultation.durationSeconds}s`);

    return NextResponse.json({
      success: true,
      duration_seconds: consultation.durationSeconds,
      consultation,
    });
  } catch (error) {
    console.error(`[API /consultations/${id}/end PATCH] Error:`, error);

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
        error: 'Failed to end consultation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
