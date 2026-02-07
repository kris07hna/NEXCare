/**
 * EdgeCare-5G | Patient-Doctor Video Call
 * Full-screen video consultation with AI-powered vitals monitoring
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Video, Camera, MoreHorizontal, PhoneOff, Signal, Heart, Activity } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function VideoCallPage({ params }: PageProps) {
  const router = useRouter();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const vitals = {
    heartRate: { value: 72, trend: '+2%', status: 'Stable' },
    spo2: 98,
    bloodPressure: '120/80',
    movement: 'Normal Movement',
  };

  const handleEndCall = () => {
    router.push('/physician-hub');
  };

  return (
    <div className="relative h-screen w-full flex overflow-hidden bg-[#0a070d] font-display text-white">
      {/* Main Patient Video Canvas (Full Screen) */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          {/* Placeholder for video feed - in production this would be a video element */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Activity className="w-16 h-16 text-white" />
            </div>
            <p className="text-lg text-white/60">Patient Video Stream</p>
            <p className="text-sm text-white/40 mt-2">Session ID: {params.id}</p>
          </div>
          {/* Overlay Gradient for UI Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
        </div>
      </div>

      {/* Header Info Overlay */}
      <div className="absolute top-6 left-8 z-20 flex items-center gap-4">
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="size-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Live Consultation</p>
            <h2 className="text-sm font-semibold">Dr. Julian Vance • Cardiology</h2>
          </div>
        </div>
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
          <Signal className="w-4 h-4 text-purple-600" />
          <p className="text-xs font-medium">5G Secure Path</p>
        </div>
      </div>

      {/* Doctor PIP (Picture-in-Picture) */}
      <div className="absolute top-6 right-8 z-20 w-72 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl group bg-slate-700">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-2">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <p className="text-sm text-white/80">Your Video</p>
          </div>
          <div className="absolute bottom-2 left-2 glass px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
            You (MD)
          </div>
        </div>
      </div>

      {/* Right Side: AI Diagnostic Panel */}
      <div className="absolute top-52 right-8 bottom-32 z-20 w-80 flex flex-col gap-4">
        {/* AI Status Card */}
        <div className="glass p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold tracking-tight">EdgeCare AI</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-600 text-[10px] font-bold border border-purple-600/30 uppercase">
              Active
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
            <Activity className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Movement AI</p>
              <p className="text-sm font-medium">{vitals.movement}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Heart Rate</p>
                <p className="text-3xl font-bold tracking-tight">
                  {vitals.heartRate.value} <span className="text-sm font-normal text-white/60">BPM</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-green-400 font-bold">
                  {vitals.heartRate.trend} {vitals.heartRate.status}
                </p>
              </div>
            </div>
            {/* Vitals Graph Sparkline */}
            <div className="h-20 w-full overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
                <defs>
                  <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#8c36e2', stopOpacity: 0.4 }}></stop>
                    <stop offset="100%" style={{ stopColor: '#8c36e2', stopOpacity: 0 }}></stop>
                  </linearGradient>
                </defs>
                <path
                  d="M0 40 Q 10 35, 20 45 T 40 30 T 60 50 T 80 20 T 100 40 T 120 10 T 140 45 T 160 25 T 180 35 T 200 30 V 60 H 0 Z"
                  fill="url(#grad)"
                ></path>
                <path
                  d="M0 40 Q 10 35, 20 45 T 40 30 T 60 50 T 80 20 T 100 40 T 120 10 T 140 45 T 160 25 T 180 35 T 200 30"
                  fill="none"
                  stroke="#8c36e2"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Additional Health Context */}
        <div className="glass p-5 rounded-2xl flex flex-col gap-3">
          <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Real-time Vitals</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40">SpO2</p>
              <p className="text-lg font-bold">{vitals.spo2}%</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40">BP</p>
              <p className="text-lg font-bold">{vitals.bloodPressure}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
        <div className="glass px-6 py-4 rounded-full flex items-center gap-4 shadow-2xl border-white/20">
          {/* Secondary Controls */}
          <div className="flex items-center gap-2 pr-4 border-r border-white/10">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`size-12 rounded-full flex items-center justify-center transition-all ${
                isMicOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              <Mic className={`w-5 h-5 ${!isMicOn ? 'text-white' : ''}`} />
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`size-12 rounded-full flex items-center justify-center transition-all ${
                isVideoOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              <Video className={`w-5 h-5 ${!isVideoOn ? 'text-white' : ''}`} />
            </button>
          </div>

          {/* Specialized Medical Controls */}
          <div className="flex items-center gap-3">
            <button className="group flex items-center gap-2 px-5 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/30">
              <Heart className="w-5 h-5 animate-pulse fill-current" />
              <span className="text-sm font-bold tracking-tight">Heart Rate Sync</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10">
              <Camera className="w-5 h-5" />
              <span className="text-sm font-bold tracking-tight">Capture Frame</span>
            </button>
            <button className="size-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Call Termination */}
          <div className="pl-4 border-l border-white/10">
            <button
              onClick={handleEndCall}
              className="size-14 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Gradient Edge for Focus */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"></div>

      <style jsx>{`
        .glass {
          background: rgba(26, 18, 33, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
