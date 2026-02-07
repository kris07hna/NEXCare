/**
 * Consultation Detail API Route
 * GET /api/consultations/[id] - Get consultation by ID
 * PATCH /api/consultations/[id]/end - End consultation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { endConsultationSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await db.initialize();

    const consultation = await db.getConsultationById(id);

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error(`[API /consultations/${id} GET] Error:`, error);
    return NextResponse.json(
      {
        error: 'Failed to fetch consultation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
