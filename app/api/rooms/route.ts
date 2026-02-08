/**
 * Rooms API Route
 * GET /api/rooms - Get all rooms with real-time online/offline status
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { roomRegistry } from '@/lib/room-registry';
import type { RoomStatus } from '@/types';

export async function GET() {
  try {
    await db.initialize();

    const registryRooms = roomRegistry.getAllRooms();
    const roomStatuses: RoomStatus[] = [];

    // Fetch all patients ONCE to avoid N+1 query
    const allPatients = await db.getPatients({ limit: 1000 });

    // Enrich room data with patient information
    for (const room of registryRooms) {
      let patientId = null;
      let patientName = null;

      // Find patient assigned to this room from pre-fetched list
      const patient = allPatients.find((p) => p.room_id === room.room_id && p.status === 'active');

      if (patient) {
        patientId = patient.id;
        patientName = patient.full_name;
      }

      roomStatuses.push({
        roomId: room.room_id,
        patientId: patientId,
        patientName: patientName,
        module: room.module,
        status: room.status,
        confidence: room.confidence,
        lastSeen: room.last_seen,
        lastUpdate: room.last_seen,
        online: room.online,
        alertLevel: room.latest_report?.alertLevel || 'normal',
        latest_report: room.latest_report,
      });
    }

    const onlineCount = roomStatuses.filter((r) => r.online).length;
    const offlineCount = roomStatuses.filter((r) => !r.online).length;

    return NextResponse.json({
      rooms: roomStatuses,
      count: roomStatuses.length,
      online: onlineCount,
      offline: offlineCount,
    });
  } catch (error) {
    console.error('[API /rooms] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch rooms',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
