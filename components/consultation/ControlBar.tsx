/**
 * Control Bar Component - Premium call controls
 */

'use client';

import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface ControlBarProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onHangUp: () => void;
  disabled?: boolean;
}

export function ControlBar({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onHangUp,
  disabled = false,
}: ControlBarProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 px-5 py-3 shadow-2xl">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleAudio}
          disabled={disabled}
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
            isAudioEnabled
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          disabled={disabled}
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
            isVideoEnabled
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>

        <div className="h-8 w-px bg-slate-700/50 mx-1" />

        {/* Hang Up */}
        <button
          onClick={onHangUp}
          disabled={disabled}
          className={`px-6 h-12 flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-red-500/30 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="End call"
        >
          <PhoneOff className="h-5 w-5" />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
}
