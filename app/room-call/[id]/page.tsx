/**
 * Room Call Receiver
 * Minimal room-side UI to accept doctor consultation
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';

interface ConsultationSession {
  id: string;
  session_id: string;
  room_id: string;
  patient_id?: string;
  roomId?: string;
  [key: string]: any;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomCallPage({ params }: PageProps) {
  const router = useRouter();
  const urlParams = useParams();
  const sessionId = urlParams.id as string;
  const [consultation, setConsultation] = useState<ConsultationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomPeerId, setRoomPeerId] = useState<string>('');

  const signalBaseUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || '';
  const doctorPeerId = `doctor-${sessionId}`;

  const {
    localStream,
    remoteStream,
    connectionState,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    hangUp,
    startCall,
  } = useWebRTC({
    sessionId,
    peerId: roomPeerId,
    remotePeerId: doctorPeerId,
    isCaller: false,
    signalBaseUrl,
  });

  useEffect(() => {
    async function loadConsultation() {
      try {
        const response = await fetch(`/api/consultations/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load consultation');
        const data = await response.json();
        setConsultation(data.consultation);
        if (data.consultation.roomId) {
          setRoomPeerId(`room-${data.consultation.roomId}`);
        }
      } catch (error) {
        console.error('Error loading consultation:', error);
      } finally {
        setLoading(false);
      }
    }

    loadConsultation();
  }, [sessionId]);

  useEffect(() => {
    if (!loading && roomPeerId) {
      startCall();
    }
  }, [loading, roomPeerId, startCall]);

  const handleHangUp = () => {
    hangUp();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200">
        Loading room session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Room Console</p>
          <h1 className="text-lg font-bold">{consultation?.roomId || 'Room'}</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Session {sessionId}</span>
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800 text-slate-200">
            <span className={`w-2 h-2 rounded-full ${connectionState === 'connected'
              ? 'bg-emerald-400'
              : connectionState === 'connecting'
                ? 'bg-amber-400'
                : 'bg-red-500'
              }`}></span>
            {connectionState}
          </span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
        <section className="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden relative">
          {remoteStream ? (
            <video
              ref={(el) => {
                if (el && remoteStream) el.srcObject = remoteStream;
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              Waiting for doctor stream...
            </div>
          )}

          <div className="absolute bottom-4 right-4 w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            {localStream ? (
              <video
                ref={(el) => {
                  if (el && localStream) el.srcObject = localStream;
                }}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <Video className="w-6 h-6" />
              </div>
            )}
          </div>
        </section>

        <aside className="bg-slate-900 rounded-2xl p-4 flex flex-col gap-4">
          <div className="text-sm text-slate-300">
            <div className="text-xs uppercase tracking-widest text-slate-500">Doctor</div>
            <div className="font-semibold">Incoming consultation</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleAudio}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold ${isAudioEnabled ? 'bg-slate-800' : 'bg-red-600'
                }`}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4 inline mr-2" /> : <MicOff className="w-4 h-4 inline mr-2" />}
              Audio
            </button>
            <button
              onClick={toggleVideo}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold ${isVideoEnabled ? 'bg-slate-800' : 'bg-red-600'
                }`}
            >
              {isVideoEnabled ? <Video className="w-4 h-4 inline mr-2" /> : <VideoOff className="w-4 h-4 inline mr-2" />}
              Video
            </button>
          </div>

          <button
            onClick={handleHangUp}
            className="w-full py-2 rounded-xl bg-red-600 font-semibold flex items-center justify-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            End Call
          </button>
        </aside>
      </main>
    </div>
  );
}
