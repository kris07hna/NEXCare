/**
 * Consultations Page - Premium video consultation hub
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, Phone, Clock, Users, Activity, AlertCircle, CheckCircle, Wifi, WifiOff, Zap } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Room } from '@/types';

export default function ConsultationsPage() {
  const router = useRouter();
  const { rooms, loading, error } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [startingConsultation, setStartingConsultation] = useState(false);

  const handleStartConsultation = async (roomId: string, patientId?: string) => {
    setStartingConsultation(true);
    setSelectedRoom(roomId);

    const toastId = toast.loading(`Starting consultation with ${roomId}...`);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          patient_id: patientId,
          doctor_name: 'Dr. Smith',
          status: 'active',
        }),
      });

      if (!response.ok) throw new Error('Failed to create consultation');
      const { consultation } = await response.json();
      toast.success(`Consultation started!`, { id: toastId });
      router.push(`/consultation/${consultation.id}`);
    } catch (err) {
      console.error('Error starting consultation:', err);
      toast.error('Failed to start consultation.', { id: toastId });
    } finally {
      setStartingConsultation(false);
      setSelectedRoom(null);
    }
  };

  const getStatusColor = (room: Room) => {
    if (!room.online) return 'bg-slate-50 text-slate-500';
    switch (room.alertLevel) {
      case 'critical': return 'bg-red-50 text-red-700';
      case 'warning': return 'bg-amber-50 text-amber-700';
      default: return 'bg-emerald-50 text-emerald-700';
    }
  };

  const getStatusIcon = (room: Room) => {
    if (!room.online) return <WifiOff className="h-4 w-4" />;
    switch (room.alertLevel) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-14 w-14">
            <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-25" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <Video className="h-6 w-6 animate-pulse text-indigo-600" />
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-bold text-red-900">Error Loading Rooms</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onlineRooms = rooms.filter(r => r.online);
  const offlineRooms = rooms.filter(r => !r.online);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Video Consultations</h1>
            <p className="text-sm text-slate-500">Start secure video calls with patients</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 stagger-children">
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
              <Wifi className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{onlineRooms.length}</p>
              <p className="text-xs text-slate-500 font-medium">Rooms Online</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
              <WifiOff className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-400">{offlineRooms.length}</p>
              <p className="text-xs text-slate-500 font-medium">Rooms Offline</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-violet-100">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-700">{rooms.filter(r => r.patientName).length}</p>
              <p className="text-xs text-slate-500 font-medium">Patients Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Online Rooms */}
      {onlineRooms.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Available Rooms</h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{onlineRooms.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {onlineRooms.map((room) => (
              <motion.div
                key={room.roomId}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Room Header */}
                <div className={`px-5 py-3 ${getStatusColor(room)} border-b flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(room)}
                    <span className="font-bold text-sm">{room.roomId}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm">
                    {room.module}
                  </span>
                </div>

                {/* Room Content */}
                <div className="p-5">
                  {/* Patient Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Patient</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {room.patientName || <span className="text-slate-300 font-normal italic">No patient assigned</span>}
                    </p>
                  </div>

                  {/* Current Status */}
                  <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Status</p>
                    <p className="text-sm font-bold text-slate-900">{room.status}</p>
                    {room.confidence && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-slate-400 font-medium">Confidence</span>
                          <span className="text-[11px] font-bold text-slate-600">{(room.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                            style={{ width: `${room.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Last Update */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-5">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(room.lastUpdate).toLocaleTimeString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartConsultation(room.roomId, room.patientId || undefined)}
                      disabled={startingConsultation && selectedRoom === room.roomId}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                    >
                      {startingConsultation && selectedRoom === room.roomId ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4" />
                          Start Call
                        </>
                      )}
                    </button>

                    {room.patientId && (
                      <Link
                        href={`/patients/${room.patientId}`}
                        className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Rooms */}
      {offlineRooms.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
            <h2 className="text-lg font-bold text-slate-900">Offline Rooms</h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{offlineRooms.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offlineRooms.map((room) => (
              <div
                key={room.roomId}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden opacity-50"
              >
                <div className="px-5 py-3 bg-slate-50 text-slate-500 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    <span className="font-bold text-sm">{room.roomId}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white">
                    {room.module}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-base font-bold text-slate-700 mb-4">
                    {room.patientName || <span className="text-slate-300 font-normal italic">No patient</span>}
                  </p>
                  <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-400">Room is currently offline</p>
                  </div>
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl cursor-not-allowed font-medium text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    Unavailable
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rooms.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-16 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
            <Video className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Rooms Available</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Rooms will appear here once AI agents start reporting data.
          </p>
        </div>
      )}
    </div>
  );
}
