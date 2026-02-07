/**
 * EdgeCare-5G Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get all network IP addresses
 */
export async function getNetworkIPs(): Promise<string[]> {
  try {
    const os = await import('os');
    const interfaces = os.networkInterfaces();
    const ips: string[] = [];

    for (const name of Object.keys(interfaces)) {
      const netInterface = interfaces[name];
      if (!netInterface) continue;

      for (const net of netInterface) {
        // Skip internal and non-IPv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(net.address);
        }
      }
    }

    return ips;
  } catch (error) {
    console.error('Error getting network IPs:', error);
    return [];
  }
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Check if timestamp is within threshold (for online/offline detection)
 */
export function isRecent(timestamp: number | string, thresholdMs: number = 30000): boolean {
  const now = Date.now();
  const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp * 1000;
  return now - ts < thresholdMs;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T = any>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `CS${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get module emoji
 */
export function getModuleEmoji(module: string): string {
  const emojiMap: Record<string, string> = {
    'NeoCare-AI': '👶',
    'GeriCare-AI': '👴',
    'DermaCare-AI': '🩺',
  };
  return emojiMap[module] || '📊';
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus.includes('sleep') || lowerStatus === 'normal') {
    return 'text-cyan-500';
  } else if (lowerStatus.includes('awake') || lowerStatus.includes('warning')) {
    return 'text-amber-500';
  } else if (lowerStatus.includes('fall') || lowerStatus.includes('critical')) {
    return 'text-red-500';
  }

  return 'text-gray-500';
}

/**
 * Get alert level badge color
 */
export function getAlertBadgeColor(level: string): string {
  const colors: Record<string, string> = {
    normal: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };
  return colors[level] || 'bg-gray-500';
}
