/**
 * Complete NeoCare-AI Dashboard with Patient Registry, Alerts, and Data Management
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Bell, Thermometer, Droplets, Bed, Heart, Wind, Timer,
  AlertCircle, Moon, TrendingUp, ChevronRight, Activity, User,
  X, Trash2, Edit, Plus, AlertTriangle, CheckCircle, Clock,
  Phone, Mail, Stethoscope, Calendar, Filter, Download
} from 'lucide-react';
import { toast } from 'sonner';
import type { Patient, AIReport, RoomStatus } from '@/types';
import {
  CriticalAlertBanner,
  RegistryView,
  AlertsView,
  ClinicalUnitsView,
  PatientDetailModal,
  InfantMonitorCard,
} from './components';

export interface InfantData {
  id: string;
  patientId: string;
  name: string;
  age: number;
  bedNumber: string;
  roomId: string;
  status: 'stable' | 'critical' | 'observation';
  aiConfidence: number;
  sleepState: 'deep-sleep' | 'light-sleep' | 'awake';
  sleepDuration: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  cycleProgress: number;
  lastUpdate: string;
  admissionDate: string;
  doctorAssigned: string;
  emergencyContact: string;
  allergies: string[];
  medicalConditions: string[];
  alertCount: number;
}

type ViewMode = 'dashboard' | 'registry' | 'alerts' | 'units';

export default function CompleteNeoCareAIPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [infants, setInfants] = useState<InfantData[]>([]);
  const [filteredInfants, setFilteredInfants] = useState<InfantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [criticalCount, setCriticalCount] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedInfant, setSelectedInfant] = useState<InfantData | null>(null);

  const clinicalUnits = [
    { id: 'all', name: 'All Units', beds: ['R1', 'R2', 'R3', 'R4'] },
    { id: 'nicu-a', name: 'NICU Zone A', beds: ['R1', 'R2'] },
    { id: 'nicu-b', name: 'NICU Zone B', beds: ['R3', 'R4'] },
  ];

  // Calculate sleep duration
  const calculateSleepDuration = (lastSeen: string): string => {
    const now = new Date();
    const last = new Date(lastSeen);
    const diff = Math.floor((now.getTime() - last.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Fetch comprehensive patient and room data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rooms
        const roomsRes = await fetch('/api/rooms');
        if (!roomsRes.ok) throw new Error('Failed to fetch rooms');
        const roomsData = await roomsRes.json();

        // Fetch patients
        const patientsRes = await fetch('/api/patients?status=active');
        if (!patientsRes.ok) throw new Error('Failed to fetch patients');
        const patientsData = await patientsRes.json();

        // Fetch AI reports for alert counts
        const reportsRes = await fetch('/api/reports?module=NeoCare-AI&limit=1000');
        if (!reportsRes.ok) throw new Error('Failed to fetch reports');
        const reportsData = await reportsRes.json();

        // Filter for NeoCare rooms
        const neoRooms = roomsData.rooms.filter((room: RoomStatus) =>
          room.module === 'NeoCare-AI'
        );

        const infantsData: InfantData[] = neoRooms.map((room: RoomStatus) => {
          const patient = patientsData.patients.find((p: Patient) =>
            p.room_id === room.roomId && p.status === 'active'
          );

          // Count critical alerts for this room
          const roomReports = reportsData.reports.filter((r: AIReport) =>
            r.room_id === room.roomId && r.alert_level === 'critical'
          );

          // Determine sleep state from AI status
          let sleepState: 'deep-sleep' | 'light-sleep' | 'awake' = 'awake';
          if (room.status === 'SLEEPING') sleepState = 'deep-sleep';
          else if (room.status === 'RESTLESS') sleepState = 'light-sleep';

          // Determine status
          let status: 'stable' | 'critical' | 'observation' = 'stable';
          if (room.alertLevel === 'critical') status = 'critical';
          else if (room.alertLevel === 'warning') status = 'observation';

          // Mock vitals (in production from hardware sensors)
          const heartRate = status === 'critical' ? 168 : Math.floor(115 + Math.random() * 15);
          const spo2 = status === 'critical' ? 94 : Math.floor(97 + Math.random() * 2);
          const temperature = 36.5 + (Math.random() * 0.5);

          return {
            id: patient?.id || room.roomId,
            patientId: patient?.patientId || `P${room.roomId}`,
            name: patient?.fullName || `Patient ${room.roomId}`,
            age: patient?.age || 0,
            bedNumber: room.roomId.replace('R', '').padStart(2, '0'),
            roomId: room.roomId,
            status,
            aiConfidence: Math.round(room.confidence * 100),
            sleepState,
            sleepDuration: room.online ? calculateSleepDuration(room.lastSeen) : '00:00:00',
            heartRate,
            spo2,
            temperature,
            cycleProgress: Math.floor(Math.random() * 100),
            lastUpdate: room.lastSeen,
            admissionDate: patient?.admissionDate || new Date().toISOString(),
            doctorAssigned: patient?.doctorAssigned || 'Not assigned',
            emergencyContact: patient?.emergencyContact || 'N/A',
            allergies: patient?.allergies ? JSON.parse(patient.allergies as string) : [],
            medicalConditions: patient?.medicalConditions ? JSON.parse(patient.medicalConditions as string) : [],
            alertCount: roomReports.length,
          };
        });

        setInfants(infantsData);
        setFilteredInfants(infantsData);
        setCriticalCount(infantsData.filter(i => i.status === 'critical').length);
        setLoading(false);
      } catch (error) {
        console.error('[NeoCare] Error fetching data:', error);
        toast.error('Failed to load NeoCare data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Filter infants based on search and unit
  useEffect(() => {
    let filtered = infants;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(infant =>
        infant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        infant.bedNumber.includes(searchQuery) ||
        infant.patientId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by clinical unit
    if (selectedUnit !== 'all') {
      const unit = clinicalUnits.find(u => u.id === selectedUnit);
      if (unit) {
        filtered = filtered.filter(infant => unit.beds.includes(infant.roomId));
      }
    }

    setFilteredInfants(filtered);
  }, [searchQuery, selectedUnit, infants]);

  const handleDeletePatient = async (infantId: string, patientId: string) => {
    if (!confirm('Are you sure you want to remove this patient from the registry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/patients/${infantId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Patient removed successfully');
        setInfants(infants.filter(i => i.id !== infantId));
      } else {
        toast.error('Failed to remove patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Error removing patient');
    }
  };

  const handleAcknowledgeAlert = async (infantId: string) => {
    toast.success(`Alert acknowledged for ${infants.find(i => i.id === infantId)?.name}`);
  };

  const exportData = () => {
    const csvData = filteredInfants.map(infant => ({
      'Patient ID': infant.patientId,
      'Name': infant.name,
      'Age (months)': infant.age,
      'Bed': infant.bedNumber,
      'Status': infant.status,
      'Heart Rate': infant.heartRate,
      'SpO2': infant.spo2,
      'Temperature': infant.temperature.toFixed(1),
      'AI Confidence': `${infant.aiConfidence}%`,
      'Sleep State': infant.sleepState,
      'Alerts': infant.alertCount,
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neocare-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading NeoCare Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <NeoCareHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        criticalCount={criticalCount}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Critical Alert Banner */}
      {criticalCount > 0 && viewMode === 'dashboard' && (
        <CriticalAlertBanner
          infants={filteredInfants.filter(i => i.status === 'critical')}
          onView={(infant: InfantData) => setSelectedInfant(infant)}
        />
      )}

      {/* Main Content */}
      <main className="p-8 md:p-10 space-y-10 max-w-screen-2xl mx-auto w-full">
        {/* View-specific content */}
        {viewMode === 'dashboard' && (
          <DashboardView
            infants={filteredInfants}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            clinicalUnits={clinicalUnits}
            onViewPatient={(infant: InfantData) => setSelectedInfant(infant)}
          />
        )}

        {viewMode === 'registry' && (
          <RegistryView
            infants={filteredInfants}
            onViewPatient={(infant: InfantData) => setSelectedInfant(infant)}
            onDeletePatient={handleDeletePatient}
            onExport={exportData}
          />
        )}

        {viewMode === 'alerts' && (
          <AlertsView
            infants={filteredInfants}
            onAcknowledge={handleAcknowledgeAlert}
            onViewPatient={(infant: InfantData) => setSelectedInfant(infant)}
          />
        )}

        {viewMode === 'units' && (
          <ClinicalUnitsView
            clinicalUnits={clinicalUnits}
            infants={infants}
          />
        )}
      </main>

      {/* Patient Detail Modal */}
      {selectedInfant && (
        <PatientDetailModal
          infant={selectedInfant}
          onClose={() => setSelectedInfant(null)}
        />
      )}
    </div>
  );
}

// Header Component
function NeoCareHeader({ searchQuery, setSearchQuery, criticalCount, viewMode, setViewMode }: any) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
      <div className="px-6 py-4 md:px-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg"></div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                NeoCare<span className="text-purple-600">-AI</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400">
                Neonatal Intensive Care Unit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:border-purple-600/30 focus:ring-4 focus:ring-purple-600/10 text-xs w-72 outline-none"
                placeholder="Search Patient ID, Name, or Bed..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-5">
              <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell className="w-5 h-5" />
                {criticalCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-6 border-t border-slate-200 dark:border-slate-800 pt-4">
          <NavTab
            active={viewMode === 'dashboard'}
            onClick={() => setViewMode('dashboard')}
            icon={<Activity className="w-4 h-4" />}
            label="Dashboard"
          />
          <NavTab
            active={viewMode === 'registry'}
            onClick={() => setViewMode('registry')}
            icon={<User className="w-4 h-4" />}
            label="Registry"
          />
          <NavTab
            active={viewMode === 'alerts'}
            onClick={() => setViewMode('alerts')}
            icon={<AlertCircle className="w-4 h-4" />}
            label="Critical Alerts"
            badge={criticalCount}
          />
          <NavTab
            active={viewMode === 'units'}
            onClick={() => setViewMode('units')}
            icon={<Bed className="w-4 h-4" />}
            label="Clinical Units"
          />
        </nav>
      </div>
    </header>
  );
}

function NavTab({ active, onClick, icon, label, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-sm font-semibold pb-1 border-b-2 transition-colors ${active
        ? 'text-purple-600 border-purple-600'
        : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-purple-600'
        }`}
    >
      {icon}
      {label}
      {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

// Dashboard View
function DashboardView({ infants, selectedUnit, setSelectedUnit, clinicalUnits, onViewPatient }: any) {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitoring Dashboard</h2>
          <p className="text-sm text-slate-500">Real-time neonatal care monitoring</p>
        </div>

        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          {clinicalUnits.map((unit: any) => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infants.map((infant: InfantData) => (
          <InfantMonitorCard
            key={infant.id}
            infant={infant}
            onView={() => onViewPatient(infant)}
          />
        ))}
      </div>

      {infants.length === 0 && (
        <div className="text-center py-20">
          <Bed className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-400">No patients found</p>
        </div>
      )}
    </>
  );
}

// Save this file, it's getting long. I'll continue in the next file...
