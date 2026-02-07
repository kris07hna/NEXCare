/**
 * WebRTC Client Library
 * Handles peer-to-peer video/audio communication with bandwidth optimization
 */

export class WebRTCClient {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private userId: string;
  private remotePeerId: string = '';
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  async initialize(onRemoteStream: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = onRemoteStream;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        console.log('[WebRTC] Remote stream received');
        this.onRemoteStreamCallback?.(event.streams[0]);
      }
    };

    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('[WebRTC] Sending ICE candidate');
        await this.sendSignal('ice-candidate', event.candidate, this.remotePeerId);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', this.peerConnection?.connectionState);
    };
  }

  async startCall(targetUserId: string, emergencyMode = false) {
    console.log(`[WebRTC] Starting call to ${targetUserId}`);

    this.remotePeerId = targetUserId;
    await this.initialize(() => {});

    this.localStream = await this.getLocalMedia(emergencyMode);

    this.localStream.getTracks().forEach(track => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });

    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);

    await this.sendSignal('offer', offer, targetUserId);

    await this.pollForAnswer();

    return this.localStream;
  }

  async answerCall(offerData: any, emergencyMode = false) {
    console.log('[WebRTC] Answering call');

    this.remotePeerId = offerData.from;
    await this.initialize(() => {});

    this.localStream = await this.getLocalMedia(emergencyMode);

    this.localStream.getTracks().forEach(track => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });

    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offerData.signal));

    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);

    await this.sendSignal('answer', answer, offerData.from);

    return this.localStream;
  }

  private async getLocalMedia(emergencyMode: boolean): Promise<MediaStream> {
    const constraints = emergencyMode
      ? {
          video: {
            width: { ideal: 320, max: 320 },
            height: { ideal: 240, max: 240 },
            frameRate: { ideal: 10, max: 15 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        }
      : {
          video: {
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 24, max: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('[WebRTC] Error accessing media:', error);
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  }

  private async sendSignal(type: string, signal: any, to: string) {
    const response = await fetch('/api/webrtc/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, from: this.userId, to, signal })
    });
    return response.json();
  }

  private async pollForAnswer() {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const response = await fetch(`/api/webrtc/signal?userId=${this.userId}&type=answer`);
      const data = await response.json();

      if (data.hasAnswer) {
        console.log('[WebRTC] Answer received');
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(data.answer.signal));
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Timeout waiting for answer');
  }

  endCall() {
    console.log('[WebRTC] Ending call');
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.localStream = null;
    this.peerConnection = null;
  }

  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }
}
