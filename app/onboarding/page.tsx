/**
 * Onboarding Page - Edge Server Initialization
 * Step-by-step wizard to configure edge nodes and room assignments
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Check, Edit, Eye, Wifi, Server,
  Baby, HeartPulse, MapPin, Trash2, Plus,
  CheckCircle, PlayCircle, Shield, Zap
} from 'lucide-react';

interface RoomConfig {
  id: string;
  roomName: string;
  agentType: 'neocare' | 'gericare';
  deviceId: string;
  edgeNode: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep] = useState(2); // Start at Room Assignment
  const [scanning] = useState(false);
  const [rooms, setRooms] = useState<RoomConfig[]>([
    {
      id: '1',
      roomName: 'Room 402',
      agentType: 'gericare',
      deviceId: 'EDG-8821',
      edgeNode: 'Alpha-01'
    },
    {
      id: '2',
      roomName: 'NICU-01',
      agentType: 'neocare',
      deviceId: 'EDG-9932',
      edgeNode: 'Alpha-02'
    }
  ]);

  const edgeNodes = [
    { id: 'alpha-01', ip: '192.168.1.104', status: 'active' },
    { id: 'alpha-02', ip: '192.168.1.105', status: 'active' }
  ];

  const agentTypes = [
    { value: 'neocare', label: 'NeoCare (Infant Monitoring)', icon: <Baby className="w-5 h-5" />, color: 'pink' },
    { value: 'gericare', label: 'GeriCare (Elderly Care)', icon: <HeartPulse className="w-5 h-5" />, color: 'blue' },
  ];

  const handleStartMonitoring = () => {
    // Save configuration to localStorage
    localStorage.setItem('edgeServerConfigured', 'true');
    localStorage.setItem('roomConfigs', JSON.stringify(rooms));
    
    // Redirect to login page
    router.push('/login');
  };

  const handleAddRoom = () => {
    const newRoom: RoomConfig = {
      id: Date.now().toString(),
      roomName: 'Room 410',
      agentType: 'gericare',
      deviceId: 'EDG-' + Math.floor(Math.random() * 10000),
      edgeNode: 'Alpha-01'
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  const handleUpdateRoom = (id: string, field: keyof RoomConfig, value: string) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, [field]: value } : room
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 lg:px-40 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
              EdgeCare-5G
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-9">
              <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors" href="#">
                Dashboard
              </a>
              <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors" href="#">
                Inventory
              </a>
              <a className="text-blue-600 text-sm font-medium" href="#">
                Server Setup
              </a>
              <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors" href="#">
                Settings
              </a>
            </nav>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 ring-2 ring-slate-200 dark:ring-slate-700"></div>
          </div>
        </div>
      </header>

      <main className="flex justify-center py-8 px-4 md:px-0">
        <div className="flex flex-col max-w-5xl w-full">
          {/* Page Header & Stepper */}
          <div className="flex flex-col gap-6 mb-8">
            <div>
              <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight mb-2">
                Edge Server Initialization
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">
                Configure local edge nodes and assign monitoring agents to patient rooms.
              </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center w-full max-w-2xl">
              {/* Step 1 - Network Scan */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-center w-full">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="h-1 w-full bg-blue-600"></div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Network Scan
                </span>
              </div>

              {/* Step 2 - Room Assignment */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-center w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    currentStep >= 2 
                      ? 'bg-blue-600 text-white' 
                      : 'border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}>
                    <Edit className="w-4 h-4" />
                  </div>
                  <div className={`h-1 w-full ${
                    currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}></div>
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  currentStep >= 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
                  Room Assignment
                </span>
              </div>

              {/* Step 3 - Monitoring */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    currentStep >= 3 
                      ? 'bg-blue-600 text-white' 
                      : 'border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}>
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  currentStep >= 3 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
                  Monitoring
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Network Scan Results */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-600" />
                  Network Scan Results
                </h3>
                <div className="space-y-4">
                  {edgeNodes.map((node, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Edge Node {node.id}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          IP: {node.ip}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold rounded uppercase">
                        Active
                      </span>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400">
                      {scanning ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full"></div>
                          <p className="text-xs font-medium">Scanning for devices...</p>
                        </>
                      ) : (
                        <p className="text-xs font-medium">Scan complete</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Room Configuration */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Room Configuration
                </h2>
                <button
                  onClick={handleAddRoom}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Room
                </button>
              </div>

              {/* Room Cards */}
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Room Name / ID
                        </label>
                        <input
                          type="text"
                          value={room.roomName}
                          onChange={(e) => handleUpdateRoom(room.id, 'roomName', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 dark:text-white outline-none"
                          placeholder="e.g. ICU-402"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          AI Agent Type
                        </label>
                        <select
                          value={room.agentType}
                          onChange={(e) => handleUpdateRoom(room.id, 'agentType', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 dark:text-white outline-none"
                        >
                          {agentTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          room.agentType === 'neocare' 
                            ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                            : room.agentType === 'gericare'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'
                        }`}>
                          {agentTypes.find(t => t.value === room.agentType)?.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Assigned Hardware
                          </p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Device: {room.deviceId} ({room.edgeNode})
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Room Card */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-10 gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                    <Server className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Additional room available on network
                  </p>
                  <button
                    onClick={handleAddRoom}
                    className="mt-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Assign Room 410
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => router.push('/landing')}
                  className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Scan
                </button>
                <button
                  onClick={handleStartMonitoring}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  Start Monitoring
                </button>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-blue-600/40 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-blue-600/60" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-bold">
                  Facility Location: Ward 4 (North Wing)
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  St. Mary&apos;s Medical Center - Edge Cluster Alpha. All data is processed locally under HIPAA compliance protocols.
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      5G Signal: Excellent
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Encryption: AES-256
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12">
        <p>© 2024 EdgeCare-5G Healthcare Solutions. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
