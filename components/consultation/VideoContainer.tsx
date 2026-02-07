/**
 * Video Container Component - Premium video display
 */

'use client';

import { useEffect, useRef } from 'react';
import { User, Video } from 'lucide-react';

interface VideoContainerProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localVideoEnabled: boolean;
  remoteVideoEnabled: boolean;
}

export function VideoContainer({
  localStream,
  remoteStream,
  localVideoEnabled,
  remoteVideoEnabled,
}: VideoContainerProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative w-full">
      {/* Remote Video (Main) */}
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden">
        {remoteStream && remoteVideoEnabled ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                <User className="h-12 w-12 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {remoteStream ? 'Remote video disabled' : 'Waiting for remote video...'}
              </p>
            </div>
          </div>
        )}

        {/* Live badge */}
        {remoteStream && remoteVideoEnabled && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-lg bg-red-500/90 backdrop-blur-sm px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
          </div>
        )}

        {/* Local Video (PiP) */}
        <div className="absolute bottom-4 right-4 w-44 aspect-video bg-slate-950 rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl transition-all hover:w-52 hover:border-indigo-500/30">
          {localStream && localVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <User className="h-6 w-6 text-slate-700" />
            </div>
          )}
          <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/50 backdrop-blur-sm px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-white/80">You</span>
          </div>
        </div>
      </div>
    </div>
  );
}
