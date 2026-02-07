/**
 * WebRTC Signaling API Route
 * POST /api/webrtc/signal - Create new WebRTC signal (offer/answer/ICE candidate)
 * GET /api/webrtc/signal/[peerId] - Get pending signals for a peer (polling)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { createSignalSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await db.initialize();

    const body = await request.json();
    const validatedData = createSignalSchema.parse(body);

    const signal = await db.createSignal({
      sessionId: validatedData.session_id,
      fromPeer: validatedData.from_peer,
      toPeer: validatedData.to_peer,
      signalType: validatedData.signal_type,
      signalData: JSON.stringify(validatedData.signal_data),
    });

    console.log(
      `[API /webrtc/signal POST] ✓ Signal created: ${validatedData.signal_type} from ${validatedData.from_peer} to ${validatedData.to_peer}`
    );

    return NextResponse.json(
      {
        success: true,
        signal_id: signal.signalId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /webrtc/signal POST] Error:', error);

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
        error: 'Failed to create signal',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
