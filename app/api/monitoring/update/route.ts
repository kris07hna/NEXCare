/**
 * Monitoring Update API Route
 * POST /api/monitoring/update - Receive real-time updates from AI agents
 */

import { NextResponse } from 'next/server';
import { roomRegistry } from '@/lib/room-registry';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.roomId || !data.module) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, module' },
        { status: 400 }
      );
    }

    // Extract data
    const {
      roomId,
      module,
      timestamp,
      aiStatus,
      confidence,
      sensors,
    } = data;

    // Convert ISO timestamp to Unix timestamp
    const unixTimestamp = timestamp 
      ? Math.floor(new Date(timestamp).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    // Build latest report
    const latestReport = {
      timestamp: unixTimestamp,
      aiStatus: aiStatus || 'Unknown',
      confidence: confidence || 0,
      sensors: sensors || {},
      alertLevel: determineAlertLevel(aiStatus, sensors),
    };

    // Update room registry
    roomRegistry.updateRoom({
      room_id: roomId,
      module: module,
      status: aiStatus || 'Unknown',
      confidence: confidence || 0,
      timestamp: unixTimestamp,
      latest_report: latestReport,
    });

    console.log(`[Monitoring] Update from ${module} - Room ${roomId}: ${aiStatus}`);

    return NextResponse.json({
      success: true,
      roomId,
      status: aiStatus,
      timestamp: unixTimestamp,
    });

  } catch (error) {
    console.error('[API /monitoring/update] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process monitoring update',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Determine alert level based on AI status and sensor data
 */
function determineAlertLevel(
  aiStatus: string, 
  sensors: { tempStatus?: string; bpm?: number; lightStatus?: string } | undefined
): string {
  // Critical alerts
  if (sensors?.tempStatus === 'High' || sensors?.tempStatus === 'Low') {
    return 'critical';
  }
  
  if (sensors?.bpm && (sensors.bpm > 180 || sensors.bpm < 40)) {
    return 'critical';
  }

  // Warning alerts
  if (aiStatus === 'Crying' || aiStatus === 'Distressed') {
    return 'warning';
  }

  if (sensors?.lightStatus === 'Too Bright') {
    return 'warning';
  }

  // Normal
  return 'normal';
}
