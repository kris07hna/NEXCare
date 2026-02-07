/**
 * Cross-Server WebRTC Configuration
 * Enables video consultations between different Edge servers via mobile hotspot
 */

import { WebRTCService } from './webrtc';

export interface CrossServerConfig {
  localServerUrl: string;    // e.g., "http://192.168.43.1:3000"
  remoteServerUrl: string;   // e.g., "http://192.168.43.2:3000"
  useHostCandidatesOnly?: boolean;  // For mobile hotspot (no STUN needed)
  iceTransportPolicy?: 'all' | 'relay';  // 'all' for P2P, 'relay' for TURN only
}

export class CrossServerWebRTC extends WebRTCService {
  private remoteServerUrl: string;
  private localServerUrl: string;
  private useHostCandidatesOnly: boolean;

  constructor(
    sessionId: string,
    peerId: string,
    remotePeerId: string,
    config: CrossServerConfig
  ) {
    super(sessionId, peerId, remotePeerId);
    this.remoteServerUrl = config.remoteServerUrl;
    this.localServerUrl = config.localServerUrl;
    this.useHostCandidatesOnly = config.useHostCandidatesOnly ?? true;
  }

  /**
   * Override sendSignal to support cross-server signaling
   */
  protected async sendSignal(
    signalType: 'offer' | 'answer' | 'ice-candidate',
    signalData: any
  ): Promise<void> {
    try {
      // Filter ICE candidates if using host-only mode (mobile hotspot)
      if (signalType === 'ice-candidate' && this.useHostCandidatesOnly) {
        // Only send host candidates (local network)
        if (signalData.candidate && !signalData.candidate.includes('typ host')) {
          console.log('[CrossServer] Skipping non-host candidate:', signalData.candidate);
          return; // Skip srflx, relay, etc.
        }
      }

      // Send to remote server for cross-server communication
      const targetUrl = `${this.remoteServerUrl}/api/webrtc/signal`;

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          from_peer: this.peerId,
          to_peer: this.remotePeerId,
          signal_type: signalType,
          signal_data: signalData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Cross-server signaling failed: ${response.status}`);
      }

      console.log(`[CrossServer] Signal sent to ${this.remoteServerUrl}: ${signalType}`);
    } catch (error) {
      console.error('[CrossServer] Error sending signal:', error);
      throw error;
    }
  }

  /**
   * Override startSignalPolling to poll from local server
   */
  protected startSignalPolling(): void {
    if (this.signalPollingInterval) {
      return;
    }

    console.log('[CrossServer] Starting signal polling from local server');

    this.signalPollingInterval = setInterval(async () => {
      try {
        // Poll from OUR local server for signals sent to us
        const response = await fetch(`${this.localServerUrl}/api/webrtc/signal/${this.peerId}`);

        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.signals && data.signals.length > 0) {
          for (const signal of data.signals) {
            await this.handleIncomingSignal(signal);
          }
        }
      } catch (error) {
        console.error('[CrossServer] Polling error:', error);
      }
    }, 1000); // Poll every second
  }

  /**
   * Get RTCConfiguration optimized for mobile hotspot
   */
  protected getMobileHotspotConfig(): RTCConfiguration {
    return {
      iceServers: this.useHostCandidatesOnly
        ? [] // No STUN needed for local network
        : [
            // Optional: Add a local STUN server if needed
            // { urls: 'stun:stun.l.google.com:19302' }
          ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all', // Allow all candidates (host, srflx, relay)
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    };
  }

  /**
   * Override createPeerConnection to use mobile hotspot config
   */
  protected createPeerConnection(): RTCPeerConnection {
    const config = this.getMobileHotspotConfig();
    // Call parent class implementation with our config
    return super.createPeerConnection(config);
  }
}

/**
 * Utility function to detect local IP address
 */
export async function getLocalIPAddress(): Promise<string | null> {
  try {
    // Create a temporary peer connection
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    return new Promise((resolve) => {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          // Extract IP from candidate string
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) {
            pc.close();
            resolve(ipMatch[1]);
          }
        }
      };

      // Timeout after 2 seconds
      setTimeout(() => {
        pc.close();
        resolve(null);
      }, 2000);
    });
  } catch (error) {
    console.error('Error detecting local IP:', error);
    return null;
  }
}

/**
 * Check if an IP is in the mobile hotspot range
 */
export function isMobileHotspotIP(ip: string): boolean {
  // Common mobile hotspot ranges:
  // - Android: 192.168.43.x
  // - iOS: 172.20.10.x
  // - Others: 192.168.137.x (Windows), 192.168.0.x (generic)

  const hotspotPrefixes = [
    '192.168.43.',   // Android hotspot
    '172.20.10.',    // iOS hotspot
    '192.168.137.',  // Windows mobile hotspot
  ];

  return hotspotPrefixes.some(prefix => ip.startsWith(prefix));
}

/**
 * Auto-detect network configuration
 */
export async function detectNetworkConfig(): Promise<{
  localIP: string | null;
  isMobileHotspot: boolean;
  suggestedConfig: Partial<CrossServerConfig>;
}> {
  const localIP = await getLocalIPAddress();
  const isMobileHotspot = localIP ? isMobileHotspotIP(localIP) : false;

  return {
    localIP,
    isMobileHotspot,
    suggestedConfig: {
      localServerUrl: localIP ? `http://${localIP}:3000` : 'http://localhost:3000',
      useHostCandidatesOnly: isMobileHotspot, // Only use direct connections on hotspot
      iceTransportPolicy: 'all',
    },
  };
}
