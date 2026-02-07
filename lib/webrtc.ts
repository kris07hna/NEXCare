/**
 * EdgeCare-5G WebRTC Service
 * Manages peer-to-peer video/audio connections
 */

import type { ConnectionState, WebRTCConfig } from '@/types';

export class WebRTCService {
  protected peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  protected sessionId: string;
  protected peerId: string;
  protected remotePeerId: string;
  protected signalBaseUrl: string;
  protected signalPollingInterval: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState = 'idle';
  private onStateChange?: (state: ConnectionState) => void;
  private onRemoteStream?: (stream: MediaStream) => void;

  constructor(sessionId: string, peerId: string, remotePeerId: string, signalBaseUrl?: string) {
    this.sessionId = sessionId;
    this.peerId = peerId;
    this.remotePeerId = remotePeerId;
    this.signalBaseUrl = signalBaseUrl?.replace(/\/$/, '') || '';
  }

  private buildSignalUrl(path: string): string {
    return `${this.signalBaseUrl}${path}`;
  }

  /**
   * Initialize WebRTC peer connection
   */
  protected createPeerConnection(config?: RTCConfiguration): RTCPeerConnection {
    const defaultConfig: RTCConfiguration = {
      iceServers:
        process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'
          ? [] // LAN-only, no STUN needed
          : [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    };

    const pc = new RTCPeerConnection(config || defaultConfig);

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('[WebRTC] New ICE candidate:', event.candidate);
        await this.sendSignal('ice-candidate', event.candidate);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      this.updateConnectionState(this.mapConnectionState(pc.connectionState));
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      }
    };

    this.peerConnection = pc;
    return pc;
  }

  /**
   * Get local media (camera + microphone)
   */
  async getLocalMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      this.updateConnectionState('initializing');

      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );

      console.log('[WebRTC] Local media acquired');
      return this.localStream;
    } catch (error) {
      console.error('[WebRTC] Error getting local media:', error);
      this.updateConnectionState('failed');
      throw error;
    }
  }

  /**
   * Create offer (caller side)
   */
  async createOffer(): Promise<void> {
    try {
      if (!this.localStream) {
        throw new Error('Local stream not available');
      }

      this.updateConnectionState('connecting');

      // Create peer connection
      const pc = this.createPeerConnection();

      // Add local stream tracks
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log('[WebRTC] Offer created');

      // Send offer via signaling server
      await this.sendSignal('offer', offer);

      // Start polling for answer
      this.startSignalPolling();
    } catch (error) {
      console.error('[WebRTC] Error creating offer:', error);
      this.updateConnectionState('failed');
      throw error;
    }
  }

  /**
   * Handle incoming offer and create answer (receiver side)
   */
  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.localStream) {
        throw new Error('Local stream not available');
      }

      this.updateConnectionState('connecting');

      // Create peer connection
      const pc = this.createPeerConnection();

      // Add local stream tracks
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });

      // Set remote description (offer)
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log('[WebRTC] Answer created');

      // Send answer via signaling server
      await this.sendSignal('answer', answer);

      // Start polling for ICE candidates
      this.startSignalPolling();
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error);
      this.updateConnectionState('failed');
      throw error;
    }
  }

  /**
   * Handle incoming answer (caller side)
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('[WebRTC] Answer set');
    } catch (error) {
      console.error('[WebRTC] Error handling answer:', error);
      throw error;
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[WebRTC] ICE candidate added');
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error);
    }
  }

  /**
   * Send signal to signaling server
   */
  protected async sendSignal(
    signalType: 'offer' | 'answer' | 'ice-candidate',
    signalData: any
  ): Promise<void> {
    try {
      const response = await fetch(this.buildSignalUrl('/api/webrtc/signal'), {
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
        throw new Error(`Signaling failed: ${response.status}`);
      }

      console.log(`[WebRTC] Signal sent: ${signalType}`);
    } catch (error) {
      console.error('[WebRTC] Error sending signal:', error);
      throw error;
    }
  }

  /**
   * Start polling for signals
   */
  protected startSignalPolling(): void {
    if (this.signalPollingInterval) {
      return; // Already polling
    }

    console.log('[WebRTC] Starting signal polling');

    this.signalPollingInterval = setInterval(async () => {
      try {
        const response = await fetch(this.buildSignalUrl(`/api/webrtc/signal/${this.peerId}`));

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
        console.error('[WebRTC] Polling error:', error);
      }
    }, 1000); // Poll every second
  }

  /**
   * Handle incoming signal
   */
  protected async handleIncomingSignal(signal: any): Promise<void> {
    const { signal_type, signal_data, from_peer } = signal;

    // Only process signals from the expected peer
    if (from_peer !== this.remotePeerId) {
      return;
    }

    console.log(`[WebRTC] Received signal: ${signal_type}`);

    try {
      switch (signal_type) {
        case 'offer':
          await this.handleOffer(signal_data);
          break;
        case 'answer':
          await this.handleAnswer(signal_data);
          break;
        case 'ice-candidate':
          await this.addIceCandidate(signal_data);
          break;
      }
    } catch (error) {
      console.error(`[WebRTC] Error handling ${signal_type}:`, error);
    }
  }

  /**
   * Stop signal polling
   */
  private stopSignalPolling(): void {
    if (this.signalPollingInterval) {
      clearInterval(this.signalPollingInterval);
      this.signalPollingInterval = null;
      console.log('[WebRTC] Signal polling stopped');
    }
  }

  /**
   * Start listening for incoming offers and ICE candidates
   */
  startListening(): void {
    this.startSignalPolling();
  }

  /**
   * Toggle audio on/off
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
      console.log(`[WebRTC] Audio ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Toggle video on/off
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
      console.log(`[WebRTC] Video ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Hang up and clean up
   */
  hangUp(): void {
    console.log('[WebRTC] Hanging up');

    this.stopSignalPolling();

    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.updateConnectionState('disconnected');
  }

  /**
   * Get connection stats
   */
  async getConnectionStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) {
      return null;
    }

    return await this.peerConnection.getStats();
  }

  /**
   * Monitor connection quality
   */
  async monitorConnectionQuality(
    callback: (quality: 'excellent' | 'good' | 'fair' | 'poor') => void
  ): Promise<void> {
    if (!this.peerConnection) {
      return;
    }

    const stats = await this.peerConnection.getStats();

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        const packetsLost = report.packetsLost || 0;
        const packetsReceived = report.packetsReceived || 0;
        const total = packetsLost + packetsReceived;

        if (total === 0) return;

        const lossRate = packetsLost / total;

        const quality =
          lossRate < 0.02 ? 'excellent' : lossRate < 0.05 ? 'good' : lossRate < 0.1 ? 'fair' : 'poor';

        callback(quality);
      }
    });
  }

  /**
   * Update connection state
   */
  private updateConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  /**
   * Map RTCPeerConnectionState to our ConnectionState
   */
  private mapConnectionState(state: RTCPeerConnectionState): ConnectionState {
    switch (state) {
      case 'new':
      case 'connecting':
        return 'connecting';
      case 'connected':
        return 'connected';
      case 'disconnected':
        return 'reconnecting';
      case 'failed':
        return 'failed';
      case 'closed':
        return 'disconnected';
      default:
        return 'idle';
    }
  }

  /**
   * Set state change callback
   */
  onConnectionStateChange(callback: (state: ConnectionState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Set remote stream callback
   */
  onRemoteStreamReceived(callback: (stream: MediaStream) => void): void {
    this.onRemoteStream = callback;
  }

  /**
   * Get current state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}
