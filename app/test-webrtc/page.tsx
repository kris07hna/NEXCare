'use client';

import { useState, useRef } from 'react';
import { WebRTCClient } from '@/lib/webrtc-client';

export default function TestWebRTCPage() {
  const [role, setRole] = useState<'caller' | 'receiver' | null>(null);
  const [callStatus, setCallStatus] = useState<string>('Not connected');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCClient | null>(null);

  const startAsCaller = async () => {
    try {
      setRole('caller');
      setCallStatus('Initializing...');

      webrtcRef.current = new WebRTCClient('doctor_test');
      await webrtcRef.current.initialize((remoteStream) => {
        console.log('Setting remote stream');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setCallStatus('Getting camera/mic access...');
      const localStream = await webrtcRef.current.startCall('patient_test', false);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      setCallStatus('Calling patient_test... Waiting for answer');
    } catch (error) {
      console.error('Error starting as caller:', error);
      setCallStatus(`Error: ${error}`);
    }
  };

  const startAsReceiver = async () => {
    try {
      setRole('receiver');
      setCallStatus('Waiting for incoming call...');

      webrtcRef.current = new WebRTCClient('patient_test');

      const checkForOffer = async () => {
        const response = await fetch('/api/webrtc/signal?userId=patient_test&type=offer');
        const data = await response.json();

        if (data.hasOffer) {
          setCallStatus('Incoming call! Answering...');

          await webrtcRef.current!.initialize((remoteStream) => {
            console.log('Setting remote stream');
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });

          const localStream = await webrtcRef.current!.answerCall(data.offer, false);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }

          setCallStatus('Connected!');
        } else {
          setTimeout(checkForOffer, 1000);
        }
      };

      checkForOffer();
    } catch (error) {
      console.error('Error starting as receiver:', error);
      setCallStatus(`Error: ${error}`);
    }
  };

  const toggleVideo = () => {
    if (webrtcRef.current) {
      const enabled = webrtcRef.current.toggleVideo();
      setVideoEnabled(enabled);
    }
  };

  const toggleAudio = () => {
    if (webrtcRef.current) {
      const enabled = webrtcRef.current.toggleAudio();
      setAudioEnabled(enabled);
    }
  };

  const endCall = () => {
    if (webrtcRef.current) {
      webrtcRef.current.endCall();
    }
    setRole(null);
    setCallStatus('Not connected');

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              WebRTC Test Page
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Test peer-to-peer video calling functionality
            </p>
            <div className="mt-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Status: <span className="font-normal">{callStatus}</span>
              </p>
            </div>
          </div>

          {!role && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={startAsCaller}
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-6 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">📞</span>
                  <div className="text-left">
                    <div className="text-xl">Start as Caller</div>
                    <div className="text-sm opacity-80">Doctor (Initiates Call)</div>
                  </div>
                </div>
              </button>

              <button
                onClick={startAsReceiver}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">🏥</span>
                  <div className="text-left">
                    <div className="text-xl">Start as Receiver</div>
                    <div className="text-sm opacity-80">Patient (Receives Call)</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Local Video (You)</h3>
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Remote Video</h3>
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {role && (
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={toggleAudio}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  audioEnabled ? 'bg-slate-200 dark:bg-slate-700' : 'bg-red-600 text-white'
                }`}
              >
                {audioEnabled ? '🎤 Mute' : '🔇 Unmute'}
              </button>

              <button
                onClick={toggleVideo}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  videoEnabled ? 'bg-slate-200 dark:bg-slate-700' : 'bg-red-600 text-white'
                }`}
              >
                {videoEnabled ? '📹 Stop Video' : '📵 Start Video'}
              </button>

              <button
                onClick={endCall}
                className="px-8 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
              >
                End Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
