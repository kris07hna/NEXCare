/**
 * EdgeCare-5G Live Consultation Interface
 * Premium full-screen video call with AI insights and real-time vitals
 */'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MoreHorizontal,
  PhoneOff, Radio, ClosedCaption, Pen, FileText,
  Notebook, Layers, Moon, Sun
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConsultationPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [consultation, setConsultation] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

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
    peerId: 'doctor-web',
    remotePeerId: 'room-agent',
    isCaller: true,
  });

  useEffect(() => {
    async function loadConsultation() {
      try {
        const response = await fetch(`/api/consultations/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load consultation');
        const data = await response.json();
        setConsultation(data.consultation);

        if (data.consultation.patientId) {
          const patientResponse = await fetch(`/api/patients/${data.consultation.patientId}`);
          if (patientResponse.ok) {
            const patientData = await patientResponse.json();
            setPatient(patientData.patient);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading consultation:', err);
        setLoading(false);
      }
    }
    loadConsultation();
  }, [sessionId]);

  useEffect(() => {
    if (connectionState === 'connected') {
      const interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  useEffect(() => {
    if (!loading && consultation) startCall();
  }, [loading, consultation, startCall]);

  const handleHangUp = async () => {
    hangUp();
    try {
      await fetch(`/api/consultations/${sessionId}/end`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } catch (err) {
      console.error('Error ending consultation:', err);
    }
    router.push('/');
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Loading consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : 'light'} h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100`}>
      {/* Top Navigation */}
      <nav className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">
            EdgeCare<span className="text-blue-600">-5G</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Secure 5G Connection
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold leading-none">Dr. Emily Carter</p>
              <p className="text-xs text-slate-500 mt-1">Cardiologist</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-blue-600 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-64px)] p-4 gap-4">
        {/* Left Sidebar - AI Insights */}
        <aside className="w-80 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* AI Real-time Insights */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">AI Real-time Insights</h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-xs font-bold uppercase">Movement Pattern</span>
                </div>
                <p className="text-sm font-semibold">Stable / Low tremors</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold uppercase">Sentiment Analysis</span>
                </div>
                <p className="text-sm font-semibold">Positive / Cooperative</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs font-bold uppercase">Oxygen Saturation</span>
                </div>
                <p className="text-sm font-semibold">94% (Near threshold)</p>
              </div>
            </div>
          </div>

          {/* Live Vitals */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Live Vitals</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-medium text-slate-500">Heart Rate</span>
                  <span className="text-lg font-bold">78 <span className="text-[10px] font-normal uppercase text-slate-400">bpm</span></span>
                </div>
                <div className="h-10 w-full bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center px-2">
                  <div className="flex items-end gap-1 h-full py-2">
                    {[50, 75, 33, 66, 50, 80, 50, 66, 75, 33].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-blue-600 rounded-full"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-medium text-slate-500">Respiratory Rate</span>
                  <span className="text-lg font-bold">18 <span className="text-[10px] font-normal uppercase text-slate-400">brpm</span></span>
                </div>
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full w-full overflow-hidden">
                  <div className="bg-blue-400 h-full w-[65%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-medium text-slate-500">Blood Pressure</span>
                  <span className="text-lg font-bold">120/80 <span className="text-[10px] font-normal uppercase text-slate-400">mmHg</span></span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Video Feed */}
        <section className="flex-1 relative flex flex-col gap-4">
          {/* Main Video Container */}
          <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-4xl overflow-hidden shadow-2xl relative group">
            {/* Remote Video (Patient) */}
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
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Waiting for patient stream...</p>
                </div>
              </div>
            )}

            {/* Recording Indicator */}
            <div className="absolute top-6 left-6 flex items-center gap-3 bg-slate-900/70 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold tracking-wide text-white">REC {formatDuration(duration)}</span>
            </div>

            {/* Doctor PIP (Picture in Picture) */}
            <div className="absolute top-6 right-6">
              <div className="w-48 aspect-video bg-slate-900 rounded-2xl border-4 border-white/30 shadow-2xl overflow-hidden ring-1 ring-black/10">
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
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <Video className="w-8 h-8 text-slate-600" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-[10px] text-white font-medium bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                  You (Dr. Emily)
                </div>
              </div>
            </div>

            {/* Patient Info Overlay */}
            <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">
              <h2 className="text-2xl font-bold">{patient?.fullName || 'Patient'}</h2>
              <p className="text-sm opacity-90">{patient?.age ? `${patient.age} y.o.` : ''} • {patient?.roomId || 'Room N/A'}</p>
            </div>

            {/* Control Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-md px-4 py-3 rounded-3xl shadow-2xl border border-white/20 flex items-center gap-4">
              <button
                onClick={toggleAudio}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 shadow-sm ${
                  isAudioEnabled
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 shadow-sm ${
                  isVideoEnabled
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm">
                <Monitor className="w-5 h-5" />
              </button>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <button
                onClick={handleHangUp}
                className="px-6 h-12 flex items-center justify-center gap-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all active:scale-95 shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Leave</span>
              </button>
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <ToolButton icon={<Radio className="w-5 h-5" />} label="Record" />
            <ToolButton icon={<ClosedCaption className="w-5 h-5" />} label="Subtitles" />
            <ToolButton icon={<Pen className="w-5 h-5" />} label="Whiteboard" />
            <ToolButton icon={<FileText className="w-5 h-5" />} label="Plan" />
            <ToolButton icon={<Notebook className="w-5 h-5" />} label="Exercise" />
            <ToolButton icon={<Layers className="w-5 h-5" />} label="Slides" />
          </div>
        </section>

        {/* Right Sidebar - Patient History & Chat */}
        <aside className="w-80 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Patient History */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Patient History</h3>
              <button className="text-blue-600 hover:underline text-xs font-semibold">View Full</button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Lisinopril 10mg</p>
                  <p className="text-xs text-slate-500">Daily - Since Jan 2024</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Last Surgery</p>
                  <p className="text-xs text-slate-500">Knee Replacement (2018)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Chronic Conditions</p>
                  <p className="text-xs text-slate-500">Osteoarthritis, Stage 1 HTN</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat/Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col flex-1 overflow-hidden">
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-blue-600 border-b-2 border-blue-600">Chat</button>
              <button className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">Notes</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex flex-col items-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                  <p className="text-sm">Good afternoon! How are you feeling today?</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 ml-1">10:20 AM</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-md">
                  <p className="text-sm">I'm good, looking forward to the appointment ✨</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 mr-1">10:25 AM</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative">
                <input
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                  placeholder="Type a message..."
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function ToolButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-w-20">
      <span className="text-blue-600">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-tight text-slate-500">{label}</span>
    </button>
  );
}
