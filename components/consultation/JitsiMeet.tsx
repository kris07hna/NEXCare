/**
 * Jitsi Video Call Component
 * Simple video conferencing using Jitsi Meet (100% free, no setup required)
 */

'use client';

import { useEffect, useState } from 'react';
import { Video } from 'lucide-react';

interface JitsiMeetProps {
  roomId: string;
  userName?: string;
  onEnd?: () => void;
}

export function JitsiMeet({ roomId, userName, onEnd }: JitsiMeetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initJitsi = () => {
    try {
      const domain = 'meet.jit.si';
      const options = {
        roomName: `nexcare-5g-${roomId}`,
        width: '100%',
        height: '100%',
        parentNode: document.getElementById('jitsi-container'),
        userInfo: {
          displayName: userName || 'Doctor',
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'desktop',
            'fullscreen',
            'hangup',
            'chat',
            'recording',
            'settings',
          ],
        },
      };

      // @ts-expect-error - Jitsi external API
      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener('videoConferenceLeft', () => {
        onEnd?.();
      });

      setLoading(false);
    } catch (err) {
      console.error('Error initializing Jitsi:', err);
      setError('Failed to initialize video call');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load Jitsi external API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initJitsi();
    script.onerror = () => setError('Failed to load Jitsi Meet');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDirectLink = () => {
    window.open(`https://meet.jit.si/nexcare-5g-${roomId}`, '_blank');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <Video className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Video Call Error</h2>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={handleDirectLink}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
        >
          Open in New Tab
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Starting video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div id="jitsi-container" className="w-full h-full" />
    </div>
  );
}

/**
 * Quick Start Button for joining video calls
 */
export function JitsiQuickStart({ roomId, disabled }: { roomId: string; disabled?: boolean }) {
  const handleClick = () => {
    const jitsiUrl = `https://meet.jit.si/nexcare-5g-${roomId}`;
    window.open(jitsiUrl, '_blank', 'width=1200,height=800');
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
    >
      <Video className="h-4 w-4" />
      Start Video Call
    </button>
  );
}
