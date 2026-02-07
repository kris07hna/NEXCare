/**
 * React Hook for WebRTC File Transfer
 * Simplified interface for P2P file sharing
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { WebRTCFileTransferService } from '@/lib/webrtc-file-transfer';
import type { FileTransferProgress, ReceivedFile } from '@/types';

interface UseFileTransferOptions {
  sessionId: string;
  peerId: string;
  remotePeerId: string;
  autoCreateDataChannel?: boolean;
}

export function useFileTransfer({
  sessionId,
  peerId,
  remotePeerId,
  autoCreateDataChannel = true,
}: UseFileTransferOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isDataChannelReady, setIsDataChannelReady] = useState(false);
  const [transferProgress, setTransferProgress] = useState<FileTransferProgress | null>(null);
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const serviceRef = useRef<WebRTCFileTransferService | null>(null);

  /**
   * Initialize WebRTC service
   */
  const initialize = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const service = new WebRTCFileTransferService(sessionId, peerId, remotePeerId, baseUrl);

      // Setup callbacks
      service.onConnectionStateChange((state) => {
        setIsConnected(state === 'connected');
        if (state === 'failed') {
          setError('Connection failed');
        }
      });

      service.onFileTransferProgress((progress) => {
        setTransferProgress(progress);
      });

      service.onFileReceivedCallback((file) => {
        const receivedFile: ReceivedFile = {
          file,
          receivedAt: new Date(),
          sender: remotePeerId,
        };
        setReceivedFiles((prev) => [...prev, receivedFile]);
        console.log('[useFileTransfer] File received:', file.name);
      });

      service.onDataChannelReady(() => {
        console.log('[useFileTransfer] Data channel ready');
        setIsDataChannelReady(true);
      });

      serviceRef.current = service;

      // Get local media (required for WebRTC connection)
      await service.getLocalMedia();

      return service;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize';
      setError(message);
      throw err;
    }
  }, [sessionId, peerId, remotePeerId]);

  /**
   * Create offer (caller initiates connection)
   */
  const createOffer = useCallback(async () => {
    if (!serviceRef.current) {
      await initialize();
    }

    const service = serviceRef.current!;

    // Create data channel before creating offer (sender side)
    if (autoCreateDataChannel) {
      service.createDataChannel();
    }

    await service.createOffer();
    service.startListening();
  }, [initialize, autoCreateDataChannel]);

  /**
   * Wait for offer (receiver waits for connection)
   */
  const waitForOffer = useCallback(async () => {
    if (!serviceRef.current) {
      await initialize();
    }

    const service = serviceRef.current!;
    service.startListening();
  }, [initialize]);

  /**
   * Send file(s) through data channel
   */
  const sendFile = useCallback(
    async (file: File) => {
      if (!serviceRef.current) {
        throw new Error('Service not initialized. Call createOffer() or waitForOffer() first.');
      }

      if (!serviceRef.current.isDataChannelReady()) {
        throw new Error('Data channel not ready. Wait for connection to establish.');
      }

      setError(null);

      try {
        await serviceRef.current.sendFile(file);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send file';
        setError(message);
        throw err;
      }
    },
    []
  );

  /**
   * Send multiple files
   */
  const sendFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        await sendFile(file);
      }
    },
    [sendFile]
  );

  /**
   * Download received file
   */
  const downloadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Disconnect and cleanup
   */
  const disconnect = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.hangUp();
      serviceRef.current = null;
    }
    setIsConnected(false);
    setIsDataChannelReady(false);
    setTransferProgress(null);
  }, []);

  /**
   * Get local and remote streams (for video if needed)
   */
  const getStreams = useCallback(() => {
    if (!serviceRef.current) {
      return { localStream: null, remoteStream: null };
    }

    return {
      localStream: serviceRef.current.getLocalStream(),
      remoteStream: serviceRef.current.getRemoteStream(),
    };
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected,
    isDataChannelReady,
    error,

    // Transfer state
    transferProgress,
    receivedFiles,

    // Actions
    createOffer,
    waitForOffer,
    sendFile,
    sendFiles,
    downloadFile,
    disconnect,
    getStreams,
  };
}
