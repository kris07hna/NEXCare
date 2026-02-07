/**
 * WebRTC Signaling Server
 * Handles offer/answer exchange and ICE candidate exchange
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for signaling (simple MVP approach)
const pendingOffers = new Map<string, any>();
const pendingAnswers = new Map<string, any>();
const iceCandidates = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, from, to, signal } = data;

    console.log(`[WebRTC Signal] ${type} from ${from} to ${to}`);

    switch (type) {
      case 'offer':
        pendingOffers.set(to, { from, signal, timestamp: Date.now() });
        return NextResponse.json({ success: true, message: 'Offer stored' });

      case 'answer':
        pendingAnswers.set(to, { from, signal, timestamp: Date.now() });
        return NextResponse.json({ success: true, message: 'Answer stored' });

      case 'ice-candidate':
        if (!iceCandidates.has(to)) {
          iceCandidates.set(to, []);
        }
        iceCandidates.get(to)!.push({ from, candidate: signal });
        return NextResponse.json({ success: true, message: 'ICE candidate stored' });

      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[WebRTC Signal] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'offer';

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    if (type === 'offer') {
      const offer = pendingOffers.get(userId);
      if (offer) {
        return NextResponse.json({ hasOffer: true, offer });
      }
      return NextResponse.json({ hasOffer: false });
    }

    if (type === 'answer') {
      const answer = pendingAnswers.get(userId);
      if (answer) {
        pendingAnswers.delete(userId);
        return NextResponse.json({ hasAnswer: true, answer });
      }
      return NextResponse.json({ hasAnswer: false });
    }

    if (type === 'ice') {
      const candidates = iceCandidates.get(userId) || [];
      iceCandidates.delete(userId);
      return NextResponse.json({ hasCandidates: candidates.length > 0, candidates });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('[WebRTC Signal] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
