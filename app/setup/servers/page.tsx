/**
 * EdgeCare-5G Edge Server Room Registry
 * Configure local edge nodes and assign monitoring agents to patient rooms
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, Check, Edit3, Eye, RefreshCw, Server,
  ChevronDown, Baby, Users2, Activity
} from 'lucide-react';

interface RoomConfig {
  id: string;
  roomName: string;
  agentType: 'neocare' | 'gericare' | 'dermacare';
  device: string;
  deviceId: string;
}

interface EdgeNode {
  id: string;
  name: string;
  ip: string;
  status: 'active' | 'inactive';
}

export default function ServerSetupPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomConfig[]>([
    {
      id: '1',
      roomName: 'Room 402',
      agentType: 'gericare',
      device: 'EDG-8821 (Alpha-01)',
      deviceId: 'alpha-01',
    },
    {
      id: '2',
      roomName: 'NICU-01',
      agentType: 'neocare',
      device: 'EDG-8822 (Alpha-02)',
      deviceId: 'alpha-02',
    },
  ]);

  const [edgeNodes] = useState<EdgeNode[]>([
    { id: '1', name: 'Edge Node alpha-01', ip: '192.168.1.104', status: 'active' },
    { id: '2', name: 'Edge Node alpha-02', ip: '192.168.1.105', status: 'active' },
  ]);

  const [currentStep, setCurrentStep] = useState(2); // 1: Network Scan, 2: Room Assignment, 3: Monitoring

  const handleAddRoom = () => {
    const newRoom: RoomConfig = {
      id: String(rooms.length + 1),
      roomName: `Room ${rooms.length + 1}`,
      agentType: 'neocare',
      device: `EDG-${8820 + rooms.length + 1} (Alpha-0${(rooms.length % 2) + 1})`,
      deviceId: `alpha-0${(rooms.length % 2) + 1}`,
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  const handleUpdateRoom = (id: string, field: keyof RoomConfig, value: string) => {
    setRooms(
      rooms.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );
  };

  const agentTypes = [
    { value: 'neocare', label: 'NeoCare (Infant Monitoring)', icon: <Baby className="w-5 h-5" /> },
    { value: 'gericare', label: 'GeriCare (Elderly Care)', icon: <Users2 className="w-5 h-5" /> },
    { value: 'dermacare', label: 'DermaCare (Skin Diagnostics)', icon: <Activity className="w-5 h-5" /> },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-40 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
            <Server className="w-5 h-5" />
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">EdgeCare-5G</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-9">
            <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors" href="/">
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-200 dark:border-slate-700"></div>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-8 px-4 md:px-0">
        <div className="flex flex-col max-w-5xl flex-1">
          {/* Page Header & Stepper */}
          <div className="flex flex-col gap-6 mb-8">
            <div>
              <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
                Edge Server Initialization
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                Configure local edge nodes and assign monitoring agents to patient rooms.
              </p>
            </div>

            {/* Stepper Component */}
            <div className="flex items-center w-full max-w-2xl">
              <StepIndicator
                icon={<Check className="w-4 h-4" />}
                label="Network Scan"
                completed
                active={currentStep === 1}
                hasLine
              />
              <StepIndicator
                icon={<Edit3 className="w-4 h-4" />}
                label="Room Assignment"
                completed={false}
                active={currentStep === 2}
                hasLine
              />
              <StepIndicator
                icon={<Eye className="w-4 h-4" />}
                label="Monitoring"
                completed={false}
                active={currentStep === 3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Server Connection Status */}
            <div className="lg:col-span-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Server className="w-8 h-8" />
                    <h3 className="font-bold text-2xl">Main Cloud Server Connection</h3>
                  </div>
                  <p className="text-sm opacity-90 mb-4">
                    Connected to: <span className="font-mono font-semibold">cloud.edgecare5g.health</span>
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold">Status: Online</span>
                    </div>
                    <div className="text-sm">
                      <span className="opacity-75">Latency:</span> <span className="font-semibold">12ms</span>
                    </div>
                    <div className="text-sm">
                      <span className="opacity-75">Uptime:</span> <span className="font-semibold">99.9%</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Configure Connection
                </button>
              </div>
            </div>

            {/* Left Column: Step 1 Summary */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Network Scan Results
                </h3>
                <div className="space-y-4">
                  {edgeNodes.map((node) => (
                    <div key={node.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{node.name}</p>
                        <p className="text-xs text-slate-500">IP: {node.ip}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded uppercase">
                        {node.status}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <p className="text-xs font-medium">Scanning for devices...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Step 2 Room Assignment */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Room Configuration</h2>
                <button
                  onClick={handleAddRoom}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Room
                </button>
              </div>

              {/* Room Registry Cards */}
              <div className="space-y-4">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    agentTypes={agentTypes}
                    onUpdate={handleUpdateRoom}
                    onDelete={handleDeleteRoom}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-blue-600/25"
                >
                  Start Monitoring →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ icon, label, completed, active, hasLine }: {
  icon: React.ReactNode;
  label: string;
  completed: boolean;
  active: boolean;
  hasLine?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="flex items-center w-full">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            completed
              ? 'bg-blue-600 text-white'
              : active
              ? 'border-2 border-blue-600 bg-blue-600/10 text-blue-600'
              : 'border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-400'
          }`}
        >
          {icon}
        </div>
        {hasLine && (
          <div className={`h-1 w-full ${completed ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
        )}
      </div>
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          completed || active ? 'text-blue-600' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function RoomCard({ room, agentTypes, onUpdate, onDelete }: {
  room: RoomConfig;
  agentTypes: any[];
  onUpdate: (id: string, field: keyof RoomConfig, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const selectedAgent = agentTypes.find((a) => a.value === room.agentType);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Room Name / ID</label>
          <input
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 dark:text-white outline-none"
            placeholder="e.g. ICU-402"
            type="text"
            value={room.roomName}
            onChange={(e) => onUpdate(room.id, 'roomName', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI Agent Type</label>
          <div className="relative">
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 dark:text-white appearance-none outline-none"
              value={room.agentType}
              onChange={(e) => onUpdate(room.id, 'agentType', e.target.value as any)}
            >
              {agentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
            {selectedAgent?.icon}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Hardware</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Device: {room.device}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(room.id)}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
