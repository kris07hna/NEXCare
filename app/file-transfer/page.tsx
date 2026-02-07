/**
 * File Transfer Demo Page
 * P2P file sharing using WebRTC Data Channel
 */

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function FileTransferPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessionId] = useState(() => `file-${Date.now()}`);
  const [peerId] = useState(() => `peer-${Math.random().toString(36).substr(2, 9)}`);
  const [remotePeerId, setRemotePeerId] = useState('');
  const [showSetup, setShowSetup] = useState(true);

  const {
    isConnected,
    isDataChannelReady,
    error,
    transferProgress,
    receivedFiles,
    createOffer,
    waitForOffer,
    sendFile,
    downloadFile,
  } = useFileTransfer({
    sessionId,
    peerId,
    remotePeerId,
    autoCreateDataChannel: true,
  });

  const handleStartAsSender = async () => {
    if (!remotePeerId) {
      alert('Please enter remote peer ID');
      return;
    }
    setShowSetup(false);
    await createOffer();
  };

  const handleStartAsReceiver = async () => {
    if (!remotePeerId) {
      alert('Please enter remote peer ID');
      return;
    }
    setShowSetup(false);
    await waitForOffer();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (let i = 0; i < files.length; i++) {
        await sendFile(files[i]);
      }
    } catch (err) {
      console.error('Error sending file:', err);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-6 w-6 text-purple-500" />;
    }
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext || '')) {
      return <Film className="h-6 w-6 text-red-500" />;
    }
    if (['txt', 'pdf', 'doc', 'docx'].includes(ext || '')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  P2P File Transfer
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  WebRTC Data Channel - Unlimited Size
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  isConnected
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-medium">Not Connected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Setup Screen */}
        {showSetup && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
              <h2 className="text-2xl font-bold mb-6">Setup Connection</h2>

              {/* Your Peer ID */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Your Peer ID</label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm">
                  {peerId}
                </div>
                <p className="text-xs text-slate-500 mt-2">Share this ID with the other device</p>
              </div>

              {/* Remote Peer ID */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Remote Peer ID</label>
                <input
                  type="text"
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                  placeholder="Enter peer ID from other device"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleStartAsSender}
                  disabled={!remotePeerId}
                  className="p-6 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="font-semibold text-blue-900 dark:text-blue-100">Send Files</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    I&apos;ll send files
                  </div>
                </button>

                <button
                  onClick={handleStartAsReceiver}
                  disabled={!remotePeerId}
                  className="p-6 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    Receive Files
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                    I&apos;ll receive files
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Transfer Screen */}
        {!showSetup && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                Send Files
              </h3>

              {/* Upload Area */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                multiple
                disabled={!isDataChannelReady}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!isDataChannelReady}
                className="w-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isDataChannelReady ? (
                  <>
                    <Upload className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Click to select files
                    </div>
                    <div className="text-sm text-slate-500 mt-1">Or drag and drop</div>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-12 w-12 text-slate-400 mx-auto mb-3 animate-spin" />
                    <div className="font-semibold text-slate-500">Waiting for connection...</div>
                  </>
                )}
              </button>

              {/* Transfer Progress */}
              {transferProgress && transferProgress.status !== 'completed' && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{transferProgress.fileName}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {transferProgress.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${transferProgress.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>
                      {formatFileSize(transferProgress.bytesTransferred)} /{' '}
                      {formatFileSize(transferProgress.fileSize)}
                    </span>
                    <span className="capitalize">{transferProgress.status}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
                </div>
              )}
            </div>

            {/* Receive Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-green-500" />
                Received Files ({receivedFiles.length})
              </h3>

              {receivedFiles.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No files received yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedFiles.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(item.file.name)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.file.name}</div>
                          <div className="text-sm text-slate-500">
                            {formatFileSize(item.file.size)} •{' '}
                            {item.receivedAt.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(item.file)}
                        className="ml-3 p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 max-w-4xl mx-auto bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🚀 WebRTC Data Channel Features
          </h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Unlimited file size</strong> - No server limits, direct P2P transfer
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Encrypted transfer</strong> - DTLS encryption built into WebRTC
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>No server storage</strong> - Files never touch the server, only signaling
                data
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Fast transfers</strong> - 16KB chunks optimized for network efficiency
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
