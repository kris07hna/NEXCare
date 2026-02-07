/**
 * Health API Route
 * GET /api/health - Server health status
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getNetworkIPs } from '@/lib/utils';
import { roomRegistry } from '@/lib/room-registry';

export async function GET() {
  try {
    await db.initialize();

    const dbStatus = db.getStatus();
    const ips = await getNetworkIPs();
    const primaryIP = ips[0] || 'localhost';

    const response = {
      status: 'healthy' as const,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      server_ip: primaryIP,
      all_ips: ips,
      port: parseInt(process.env.PORT || '3000'),
      database: {
        status: dbStatus.status,
        type: dbStatus.type,
      },
      ai_agents: {
        online: roomRegistry.getOnlineCount(),
        total: roomRegistry.getAllRooms().length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /health] Error:', error);
    return NextResponse.json(
      {
        status: 'down',
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
