/**
 * EdgeCare-5G Room Registry
 * In-memory tracking of room status for real-time monitoring
 */

import type { RoomRegistryEntry } from '../types';

class RoomRegistry {
  private rooms: Map<string, RoomRegistryEntry> = new Map();
  private readonly OFFLINE_THRESHOLD_MS = 30000; // 30 seconds

  /**
   * Update room status from AI report
   */
  updateRoom(data: {
    room_id: string;
    module: string;
    status: string;
    confidence: number;
    timestamp: number;
    latest_report: any;
  }): void {
    const lastSeen = new Date(data.timestamp * 1000).toISOString();

    this.rooms.set(data.room_id, {
      room_id: data.room_id,
      module: data.module,
      status: data.status,
      confidence: data.confidence,
      last_seen: lastSeen,
      online: true,
      latest_report: data.latest_report,
    });
  }

  /**
   * Get room status
   */
  getRoom(roomId: string): RoomRegistryEntry | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check if room is still online
    const lastSeenTime = new Date(room.last_seen).getTime();
    const now = Date.now();
    const isOnline = now - lastSeenTime < this.OFFLINE_THRESHOLD_MS;

    return {
      ...room,
      online: isOnline,
    };
  }

  /**
   * Get all rooms with online/offline status
   */
  getAllRooms(): RoomRegistryEntry[] {
    const now = Date.now();
    const rooms: RoomRegistryEntry[] = [];

    for (const [roomId, room] of this.rooms.entries()) {
      const lastSeenTime = new Date(room.last_seen).getTime();
      const isOnline = now - lastSeenTime < this.OFFLINE_THRESHOLD_MS;

      rooms.push({
        ...room,
        online: isOnline,
      });
    }

    return rooms;
  }

  /**
   * Get online room count
   */
  getOnlineCount(): number {
    return this.getAllRooms().filter((r) => r.online).length;
  }

  /**
   * Get offline room count
   */
  getOfflineCount(): number {
    return this.getAllRooms().filter((r) => !r.online).length;
  }

  /**
   * Clear all rooms (for testing)
   */
  clear(): void {
    this.rooms.clear();
  }

  /**
   * Remove a specific room
   */
  removeRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }
}

// Singleton instance
export const roomRegistry = new RoomRegistry();
