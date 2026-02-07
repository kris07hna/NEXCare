/**
 * EdgeCare-5G WebRTC File Transfer Service
 * Extends WebRTC with Data Channel for unlimited file transfers
 */

import { WebRTCService } from './webrtc';
import type { FileTransferProgress } from '@/types';

export class WebRTCFileTransferService extends WebRTCService {
  private dataChannel: RTCDataChannel | null = null;
  private receivedChunks: ArrayBuffer[] = [];
  private fileMetadata: {
    name: string;
    size: number;
    type: string;
    totalChunks: number;
  } | null = null;

  private onFileProgress?: (progress: FileTransferProgress) => void;
  private onFileReceived?: (file: File) => void;
  private onDataChannelOpen?: () => void;

  private readonly CHUNK_SIZE = 16384; // 16KB chunks (optimal for WebRTC)

  /**
   * Override createPeerConnection to add data channel support
   */
  protected createPeerConnection(config?: RTCConfiguration): RTCPeerConnection {
    const pc = super.createPeerConnection(config);

    // Handle incoming data channels (receiver side)
    pc.ondatachannel = (event) => {
      console.log('[WebRTC-File] Data channel received');
      this.setupDataChannel(event.channel);
    };

    return pc;
  }

  /**
   * Create data channel (sender side)
   */
  createDataChannel(label: string = 'fileTransfer'): RTCDataChannel {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    if (this.dataChannel) {
      console.log('[WebRTC-File] Data channel already exists');
      return this.dataChannel;
    }

    console.log('[WebRTC-File] Creating data channel:', label);

    this.dataChannel = this.peerConnection.createDataChannel(label, {
      ordered: true, // Preserve order for file transfers
      maxRetransmits: 3, // Retry failed packets
    });

    this.setupDataChannel(this.dataChannel);
    return this.dataChannel;
  }

  /**
   * Setup data channel event handlers
   */
  private setupDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel;

    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      console.log('[WebRTC-File] Data channel opened');
      if (this.onDataChannelOpen) {
        this.onDataChannelOpen();
      }
    };

    channel.onclose = () => {
      console.log('[WebRTC-File] Data channel closed');
    };

    channel.onerror = (error) => {
      console.error('[WebRTC-File] Data channel error:', error);
    };

    channel.onmessage = async (event) => {
      await this.handleDataChannelMessage(event.data);
    };
  }

  /**
   * Handle incoming data channel messages
   */
  private async handleDataChannelMessage(data: string | ArrayBuffer): Promise<void> {
    // Check if it's metadata (JSON string)
    if (typeof data === 'string') {
      try {
        const message = JSON.parse(data);

        if (message.type === 'file-metadata') {
          console.log('[WebRTC-File] Receiving file metadata:', message);
          this.fileMetadata = {
            name: message.name,
            size: message.size,
            type: message.fileType,
            totalChunks: message.totalChunks,
          };
          this.receivedChunks = [];

          if (this.onFileProgress) {
            this.onFileProgress({
              fileName: message.name,
              fileSize: message.size,
              bytesTransferred: 0,
              progress: 0,
              status: 'receiving',
            });
          }
        } else if (message.type === 'file-complete') {
          console.log('[WebRTC-File] File transfer complete');
          await this.assembleReceivedFile();
        }
      } catch (error) {
        console.error('[WebRTC-File] Error parsing message:', error);
      }
    }
    // It's a file chunk (ArrayBuffer)
    else if (data instanceof ArrayBuffer) {
      this.receivedChunks.push(data);

      if (this.fileMetadata && this.onFileProgress) {
        const bytesReceived = this.receivedChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
        const progress = (bytesReceived / this.fileMetadata.size) * 100;

        this.onFileProgress({
          fileName: this.fileMetadata.name,
          fileSize: this.fileMetadata.size,
          bytesTransferred: bytesReceived,
          progress: Math.round(progress),
          status: 'receiving',
          chunksReceived: this.receivedChunks.length,
          totalChunks: this.fileMetadata.totalChunks,
        });
      }
    }
  }

  /**
   * Assemble received chunks into a file
   */
  private async assembleReceivedFile(): Promise<void> {
    if (!this.fileMetadata || this.receivedChunks.length === 0) {
      console.error('[WebRTC-File] Cannot assemble file: missing metadata or chunks');
      return;
    }

    try {
      // Combine all chunks into a single blob
      const blob = new Blob(this.receivedChunks, { type: this.fileMetadata.type });
      const file = new File([blob], this.fileMetadata.name, { type: this.fileMetadata.type });

      console.log('[WebRTC-File] File assembled:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (this.onFileProgress) {
        this.onFileProgress({
          fileName: this.fileMetadata.name,
          fileSize: this.fileMetadata.size,
          bytesTransferred: this.fileMetadata.size,
          progress: 100,
          status: 'completed',
        });
      }

      if (this.onFileReceived) {
        this.onFileReceived(file);
      }

      // Clean up
      this.receivedChunks = [];
      this.fileMetadata = null;
    } catch (error) {
      console.error('[WebRTC-File] Error assembling file:', error);

      if (this.onFileProgress && this.fileMetadata) {
        this.onFileProgress({
          fileName: this.fileMetadata.name,
          fileSize: this.fileMetadata.size,
          bytesTransferred: 0,
          progress: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Send file through data channel
   */
  async sendFile(file: File): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel not ready. Ensure connection is established first.');
    }

    console.log('[WebRTC-File] Starting file transfer:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);

    // Send file metadata first
    const metadata = {
      type: 'file-metadata',
      name: file.name,
      size: file.size,
      fileType: file.type,
      totalChunks,
    };

    this.dataChannel.send(JSON.stringify(metadata));

    if (this.onFileProgress) {
      this.onFileProgress({
        fileName: file.name,
        fileSize: file.size,
        bytesTransferred: 0,
        progress: 0,
        status: 'sending',
      });
    }

    // Read file and send in chunks
    let offset = 0;
    let chunksSent = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
      const arrayBuffer = await chunk.arrayBuffer();

      // Wait if buffer is getting full (backpressure handling)
      while (this.dataChannel.bufferedAmount > this.CHUNK_SIZE * 10) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      this.dataChannel.send(arrayBuffer);

      offset += this.CHUNK_SIZE;
      chunksSent++;

      // Report progress
      if (this.onFileProgress && (chunksSent % 10 === 0 || offset >= file.size)) {
        const progress = Math.min((offset / file.size) * 100, 100);

        this.onFileProgress({
          fileName: file.name,
          fileSize: file.size,
          bytesTransferred: Math.min(offset, file.size),
          progress: Math.round(progress),
          status: 'sending',
          chunksSent,
          totalChunks,
        });
      }
    }

    // Send completion message
    this.dataChannel.send(
      JSON.stringify({
        type: 'file-complete',
        name: file.name,
      })
    );

    console.log('[WebRTC-File] File transfer complete:', file.name);

    if (this.onFileProgress) {
      this.onFileProgress({
        fileName: file.name,
        fileSize: file.size,
        bytesTransferred: file.size,
        progress: 100,
        status: 'completed',
      });
    }
  }

  /**
   * Send multiple files
   */
  async sendFiles(files: File[]): Promise<void> {
    for (const file of files) {
      await this.sendFile(file);
    }
  }

  /**
   * Set file progress callback
   */
  onFileTransferProgress(callback: (progress: FileTransferProgress) => void): void {
    this.onFileProgress = callback;
  }

  /**
   * Set file received callback
   */
  onFileReceivedCallback(callback: (file: File) => void): void {
    this.onFileReceived = callback;
  }

  /**
   * Set data channel open callback
   */
  onDataChannelReady(callback: () => void): void {
    this.onDataChannelOpen = callback;
  }

  /**
   * Check if data channel is ready
   */
  isDataChannelReady(): boolean {
    return this.dataChannel !== null && this.dataChannel.readyState === 'open';
  }

  /**
   * Get data channel state
   */
  getDataChannelState(): RTCDataChannelState | null {
    return this.dataChannel?.readyState || null;
  }

  /**
   * Override hangUp to close data channel
   */
  override hangUp(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    this.receivedChunks = [];
    this.fileMetadata = null;

    super.hangUp();
  }
}
