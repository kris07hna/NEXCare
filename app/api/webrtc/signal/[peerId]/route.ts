/**
 * WebRTC Signal Polling API Route
 * GET /api/webrtc/signal/[peerId] - Get pending signals for a peer
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ peerId: string }> }) {
  const { peerId } = await params;

  try {
    await db.initialize();

    const signals = await db.getPendingSignals(peerId);

    // Mark signals as delivered
    for (const signal of signals) {
      await db.markSignalDelivered(signal.signalId);
    }

    // Parse signal data back to objects
    const parsedSignals = signals.map((signal) => ({
      ...signal,
      signalData: JSON.parse(signal.signalData),
    }));

    return NextResponse.json({
      signals: parsedSignals,
      count: parsedSignals.length,
    });
  } catch (error) {
    console.error(`[API /webrtc/signal/${peerId} GET] Error:`, error);
    return NextResponse.json(
      {
        error: 'Failed to fetch signals',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
