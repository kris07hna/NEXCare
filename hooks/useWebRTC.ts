/**
 * EdgeCare-5G useWebRTC Hook
 * React hook for managing WebRTC connections
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCService } from '@/lib/webrtc';
import type { ConnectionState } from '@/types';

interface UseWebRTCOptions {
  sessionId: string;
  peerId: string;
  remotePeerId: string;
  isCaller: boolean;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: ConnectionState;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  error: string | null;
  startCall: () => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  hangUp: () => void;
}

export function useWebRTC({
  sessionId,
  peerId,
  remotePeerId,
  isCaller,
}: UseWebRTCOptions): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<
    'excellent' | 'good' | 'fair' | 'poor' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const qualityMonitorRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebRTC service
  useEffect(() => {
    webrtcServiceRef.current = new WebRTCService(sessionId, peerId, remotePeerId);

    // Set up callbacks
    webrtcServiceRef.current.onConnectionStateChange((state) => {
      setConnectionState(state);

      if (state === 'connected') {
        setError(null);
        startQualityMonitoring();
      } else if (state === 'failed') {
        setError('Connection failed. Please try again.');
      }
    });

    webrtcServiceRef.current.onRemoteStreamReceived((stream) => {
      setRemoteStream(stream);
    });

    return () => {
      // Cleanup
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.hangUp();
      }
      stopQualityMonitoring();
    };
  }, [sessionId, peerId, remotePeerId]);

  /**
   * Start the call
   */
  const startCall = useCallback(async () => {
    if (!webrtcServiceRef.current) {
      setError('WebRTC service not initialized');
      return;
    }

    try {
      setError(null);

      // Get local media
      const stream = await webrtcServiceRef.current.getLocalMedia();
      setLocalStream(stream);

      // If caller, create offer
      if (isCaller) {
        await webrtcServiceRef.current.createOffer();
      }
      // If receiver, start polling for offer
      else {
        // Polling is handled automatically by WebRTCService
      }
    } catch (err) {
      console.error('[useWebRTC] Error starting call:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to access camera/microphone'
      );
      setConnectionState('failed');
    }
  }, [isCaller]);

  /**
   * Toggle audio on/off
   */
  const toggleAudio = useCallback(() => {
    if (webrtcServiceRef.current) {
      const newState = !isAudioEnabled;
      webrtcServiceRef.current.toggleAudio(newState);
      setIsAudioEnabled(newState);
    }
  }, [isAudioEnabled]);

  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback(() => {
    if (webrtcServiceRef.current) {
      const newState = !isVideoEnabled;
      webrtcServiceRef.current.toggleVideo(newState);
      setIsVideoEnabled(newState);
    }
  }, [isVideoEnabled]);

  /**
   * Hang up the call
   */
  const hangUp = useCallback(() => {
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.hangUp();
    }
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('disconnected');
    stopQualityMonitoring();
  }, []);

  /**
   * Start monitoring connection quality
   */
  const startQualityMonitoring = () => {
    stopQualityMonitoring();

    qualityMonitorRef.current = setInterval(async () => {
      if (webrtcServiceRef.current) {
        await webrtcServiceRef.current.monitorConnectionQuality((quality) => {
          setConnectionQuality(quality);
        });
      }
    }, 2000); // Check every 2 seconds
  };

  /**
   * Stop monitoring connection quality
   */
  const stopQualityMonitoring = () => {
    if (qualityMonitorRef.current) {
      clearInterval(qualityMonitorRef.current);
      qualityMonitorRef.current = null;
    }
  };

  return {
    localStream,
    remoteStream,
    connectionState,
    isAudioEnabled,
    isVideoEnabled,
    connectionQuality,
    error,
    startCall,
    toggleAudio,
    toggleVideo,
    hangUp,
  };
}
