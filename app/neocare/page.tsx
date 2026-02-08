/**
 * NeoCare-AI Pediatric Dashboard
 * Specialized neonatal/infant monitoring interface
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Bell, Thermometer, Droplets, Bed, Heart, Wind, Timer,
  AlertCircle, Moon, TrendingUp, ChevronRight, Activity, ShieldAlert,
  ClipboardList, Hospital, CheckCircle2, AlertTriangle, Video, Camera
} from 'lucide-react';
import { useRef, useEffect } from 'react';

interface InfantData {
  id: string;
  name: string;
  bedNumber: string;
  status: 'stable' | 'critical' | 'observation';
  aiConfidence: number;
  sleepState: 'deep-sleep' | 'light-sleep' | 'awake';
  sleepDuration: string;
  heartRate: number;
  spo2: number;
  cycleProgress: number;
  imageUrl?: string;
}

interface RegistryPatient {
  id: string;
  name: string;
  bedNumber: string;
  status: 'stable' | 'critical' | 'observation';
  guardian: string;
  admissionDate: string;
  carePlan: string;
  doctor: string;
  alerts: number;
}

interface AlertItem {
  id: string;
  bedNumber: string;
  patientName: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  time: string;
  acknowledged: boolean;
}

interface ClinicalUnit {
  id: string;
  name: string;
  occupancy: { current: number; total: number };
  status: 'stable' | 'busy' | 'critical';
  lead: string;
  onDuty: number;
  equipment: string[];
  notes: string;
}

export default function NeoCareAIPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registry' | 'alerts' | 'units' | 'live'>('dashboard');
  
  // Get backend URL from environment variable
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const [selectedRegistryId, setSelectedRegistryId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Live Monitoring State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('Waiting for camera...');
  const [liveColor, setLiveColor] = useState<string>('gray'); // 'gray', 'green', 'red'
  const [sensorValues, setSensorValues] = useState<{
    temperature: number;
    tempStatus?: string;
    lightStatus?: string;
    bpm?: number;
    status: string;
  }>({
    temperature: 0,
    status: 'Connecting...',
    bpm: 0
  });

  const startMonitoring = async () => {
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setLiveStatus('Error: Camera API not available. Use HTTPS or localhost.');
        alert('Camera access requires HTTPS connection or localhost.\nCurrent URL: ' + window.location.href);
        return;
      }

      // Check if any cameras are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        setLiveStatus('Error: No camera detected on this device');
        alert('No camera found!\n\nPlease check:\n1. Camera is connected\n2. Camera drivers are installed\n3. Camera is not disabled in Device Manager');
        return;
      }

      console.log(`Found ${cameras.length} camera(s):`, cameras.map(c => c.label || 'Unknown Camera'));

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsMonitoring(true);
        setLiveStatus('Camera Active. Analyzing...');

        // Start polling backend
        const intervalId = setInterval(captureAndCheck, 1000); // Check every second
        // Store interval ID to clear later if needed (simple implementation for now)
        (window as any).monitorInterval = intervalId;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Error: Camera Access Failed';
      let alertMessage = 'Camera Error\n\n';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Error: Camera Permission Denied';
        alertMessage += 'You denied camera access!\n\nTo fix:\n1. Click the camera icon in browser address bar\n2. Allow camera access\n3. Refresh the page and try again';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Error: No Camera Found';
        alertMessage += 'No camera detected!\n\nPlease check:\n1. Camera is connected\n2. Camera is enabled in Device Manager\n3. Close other apps using the camera';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Error: Camera Already in Use';
        alertMessage += 'Camera is being used by another application!\n\nTo fix:\n1. Close other apps using camera (Zoom, Teams, etc.)\n2. Check if another browser tab is using camera\n3. Restart your browser';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Error: Camera Not Compatible';
        alertMessage += 'Your camera doesn\'t support the required settings.\n\nTrying with default settings...';
        
        // Retry with basic settings
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setIsMonitoring(true);
            setLiveStatus('Camera Active (Basic Quality)');
            const intervalId = setInterval(captureAndCheck, 1000);
            (window as any).monitorInterval = intervalId;
            return;
          }
        } catch (retryErr) {
          console.error("Retry failed:", retryErr);
        }
      } else if (err.name === 'TypeError') {
        errorMessage = 'Error: Browser Not Supported';
        alertMessage += 'Your browser doesn\'t support camera access!\n\nPlease use:\n- Chrome 53+\n- Firefox 36+\n- Edge 12+\n- Safari 11+';
      } else {
        alertMessage += `Unknown error: ${err.message}\n\nTry:\n1. Refresh the page\n2. Restart your browser\n3. Check camera in Device Manager`;
      }

      setLiveStatus(errorMessage);
      alert(alertMessage);
    }
  };

  const stopMonitoring = () => {
    if ((window as any).monitorInterval) clearInterval((window as any).monitorInterval);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsMonitoring(false);
    setLiveStatus('Monitoring Stopped');
    setLiveColor('gray');
  };

  const captureAndCheck = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    const dataUrl = canvasRef.current.toDataURL('image/jpeg');

    try {
      const response = await fetch(`${backendUrl}/process_frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await response.json();
      setLiveStatus(data.status); // "Awake", "Sleeping", "No Face Detected"
      setLiveColor(data.color);   // "green", "red", "gray"
    } catch (error) {
      console.error("Backend Error:", error);
      setLiveStatus("Backend Disconnected (Run python app.py)");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).monitorInterval) clearInterval((window as any).monitorInterval);
    };
  }, []);

  // Poll sensors even if camera is off (optional, but good for testing)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/sensor_data`);
        const data = await res.json();
        setSensorValues(data);
      } catch (e) { }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const infants: InfantData[] = [
    {
      id: '1',
      name: 'Mia',
      bedNumber: '01',
      status: 'stable',
      aiConfidence: 98.4,
      sleepState: 'deep-sleep',
      sleepDuration: '02:15:40',
      heartRate: 124,
      spo2: 99,
      cycleProgress: 66,
    },
    {
      id: '2',
      name: 'Leo',
      bedNumber: '04',
      status: 'critical',
      aiConfidence: 99.2,
      sleepState: 'awake',
      sleepDuration: '00:45:12',
      heartRate: 168,
      spo2: 94,
      cycleProgress: 35,
    },
    {
      id: '3',
      name: 'Emma',
      bedNumber: '07',
      status: 'stable',
      aiConfidence: 97.8,
      sleepState: 'light-sleep',
      sleepDuration: '01:30:22',
      heartRate: 118,
      spo2: 98,
      cycleProgress: 52,
    },
    {
      id: '4',
      name: 'Noah',
      bedNumber: '10',
      status: 'observation',
      aiConfidence: 96.5,
      sleepState: 'deep-sleep',
      sleepDuration: '03:05:18',
      heartRate: 115,
      spo2: 97,
      cycleProgress: 78,
    },
  ];

  const environmentalData = {
    temperature: 22.4,
    humidity: 45,
    occupancy: { current: 12, total: 16 },
  };

  const registryPatients: RegistryPatient[] = [
    {
      id: 'PT-2001',
      name: 'Mia Johnson',
      bedNumber: '01',
      status: 'stable',
      guardian: 'Ava Johnson',
      admissionDate: '2026-02-04',
      carePlan: 'Thermal regulation, feeding schedule every 3 hrs',
      doctor: 'Dr. Williams',
      alerts: 0,
    },
    {
      id: 'PT-2004',
      name: 'Leo Martinez',
      bedNumber: '04',
      status: 'critical',
      guardian: 'Elena Martinez',
      admissionDate: '2026-02-03',
      carePlan: 'Cardio monitoring, oxygen support, hourly checks',
      doctor: 'Dr. Singh',
      alerts: 2,
    },
    {
      id: 'PT-2007',
      name: 'Emma Chen',
      bedNumber: '07',
      status: 'stable',
      guardian: 'Wei Chen',
      admissionDate: '2026-01-30',
      carePlan: 'Sleep cycle optimization, feeding support',
      doctor: 'Dr. Kapoor',
      alerts: 0,
    },
    {
      id: 'PT-2010',
      name: 'Noah Patel',
      bedNumber: '10',
      status: 'observation',
      guardian: 'Priya Patel',
      admissionDate: '2026-02-01',
      carePlan: 'Respiratory observation, vitals every 2 hrs',
      doctor: 'Dr. Osei',
      alerts: 1,
    },
  ];

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'AL-3101',
      bedNumber: '04',
      patientName: 'Leo Martinez',
      severity: 'critical',
      description: 'HR deviation detected. Automated triage confirms 99% accuracy.',
      time: '2 min ago',
      acknowledged: false,
    },
    {
      id: 'AL-3102',
      bedNumber: '10',
      patientName: 'Noah Patel',
      severity: 'warning',
      description: 'SpO2 trending low (94%). Monitor for 15 minutes.',
      time: '6 min ago',
      acknowledged: false,
    },
    {
      id: 'AL-3097',
      bedNumber: '02',
      patientName: 'Sophia Lee',
      severity: 'info',
      description: 'HR normalized after intervention. Auto log updated.',
      time: '28 min ago',
      acknowledged: true,
    },
  ]);

  const clinicalUnits: ClinicalUnit[] = [
    {
      id: 'UNIT-B',
      name: 'Neo-Natal Unit • Zone B',
      occupancy: { current: 12, total: 16 },
      status: 'busy',
      lead: 'Dr. Williams',
      onDuty: 7,
      equipment: ['Ventilators', 'Incubators', 'AI sleep sensors'],
      notes: 'High acuity load. Prioritize cardio monitoring.',
    },
    {
      id: 'UNIT-C',
      name: 'Pediatric ICU • Zone C',
      occupancy: { current: 8, total: 10 },
      status: 'critical',
      lead: 'Dr. Singh',
      onDuty: 6,
      equipment: ['ECG telemetry', 'Infusion pumps', 'Portable ultrasound'],
      notes: 'Two critical cases. Rapid response on standby.',
    },
    {
      id: 'UNIT-A',
      name: 'Infant Recovery • Zone A',
      occupancy: { current: 9, total: 14 },
      status: 'stable',
      lead: 'Dr. Kapoor',
      onDuty: 5,
      equipment: ['Phototherapy', 'Monitoring wearables', 'Feeding pumps'],
      notes: 'Stable trends. Maintain routine checks.',
    },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchesQuery = (value: string) => value.toLowerCase().includes(normalizedQuery);

  const filteredInfants = normalizedQuery
    ? infants.filter((infant) => matchesQuery(infant.name) || matchesQuery(infant.bedNumber) || matchesQuery(`bed ${infant.bedNumber}`))
    : infants;

  const filteredRegistry = normalizedQuery
    ? registryPatients.filter((patient) =>
      matchesQuery(patient.name) ||
      matchesQuery(patient.id) ||
      matchesQuery(patient.bedNumber) ||
      matchesQuery(`bed ${patient.bedNumber}`)
    )
    : registryPatients;

  const filteredAlerts = normalizedQuery
    ? alerts.filter((alert) =>
      matchesQuery(alert.patientName) ||
      matchesQuery(alert.bedNumber) ||
      matchesQuery(`bed ${alert.bedNumber}`) ||
      matchesQuery(alert.description)
    )
    : alerts;

  const filteredUnits = normalizedQuery
    ? clinicalUnits.filter((unit) => matchesQuery(unit.name) || matchesQuery(unit.lead))
    : clinicalUnits;

  const selectedRegistry =
    registryPatients.find((patient) => patient.id === selectedRegistryId) || filteredRegistry[0] || null;

  const selectedUnit =
    clinicalUnits.find((unit) => unit.id === selectedUnitId) || filteredUnits[0] || null;

  const unacknowledgedCount = alerts.filter((alert) => !alert.acknowledged).length;

  return (
    <div className="transition-colors duration-300 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-4 md:px-10">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg"></div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                NeoCare<span className="text-purple-600">-AI</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400">
                Precision Pediatric Network
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <TabButton
              isActive={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              label="Dashboard"
            />
            <TabButton
              isActive={activeTab === 'registry'}
              onClick={() => setActiveTab('registry')}
              label="Registry"
            />
            <button
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 border-b-2 pb-1 ${activeTab === 'alerts'
                ? 'text-purple-600 border-purple-600'
                : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 border-transparent'
                }`}
              onClick={() => setActiveTab('alerts')}
            >
              Critical Alerts
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {unacknowledgedCount}
              </span>
            </button>
            <TabButton
              isActive={activeTab === 'units'}
              onClick={() => setActiveTab('units')}
              label="Clinical Units"
            />
            <TabButton
              isActive={activeTab === 'live'}
              onClick={() => setActiveTab('live')}
              label="Live Monitor (AI)"
            />
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              className="pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:border-purple-600/30 focus:ring-4 focus:ring-purple-600/10 text-xs w-72 outline-none"
              placeholder="Search by Patient ID or Bed No..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-5">
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="w-9 h-9 rounded-lg bg-slate-200 overflow-hidden ring-2 ring-slate-50 dark:ring-slate-800 shadow-sm">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-cyan-400"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Critical Alert Banner */}
      <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600 w-5 h-5" />
          <p className="text-xs font-semibold text-red-800 dark:text-red-400">
            <span className="font-extrabold uppercase mr-2 tracking-wide text-[10px] bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">
              Critical
            </span>{' '}
            HR Deviation in Bed #04 (Infant Leo). Automated triage confirms 99% accuracy.
          </p>
        </div>
        <button
          className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1 rounded transition-colors"
          onClick={() => setActiveTab('alerts')}
        >
          Launch Rapid View
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-10 space-y-10 max-w-screen-2xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Bed className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Neo-Natal Unit • Zone B</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  Unit Command Center
                </h2>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
                <EnvironmentalCard
                  icon={<Thermometer className="w-5 h-5" />}
                  label="Amb. Temp"
                  value={`${environmentalData.temperature}°C`}
                  color="cyan"
                />
                <EnvironmentalCard
                  icon={<Droplets className="w-5 h-5" />}
                  label="Humidity"
                  value={`${environmentalData.humidity}%`}
                  color="purple"
                />
                <EnvironmentalCard
                  icon={<Bed className="w-5 h-5" />}
                  label="Cen. Occ."
                  value={`${environmentalData.occupancy.current} / ${environmentalData.occupancy.total}`}
                  color="slate"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredInfants.length === 0 ? (
                  <EmptyState title="No infants found" description="Try a different search or clear the filter." />
                ) : (
                  filteredInfants.map((infant) => (
                    <InfantCard key={infant.id} infant={infant} />
                  ))
                )}
              </div>

              <div className="lg:col-span-4 space-y-6">
                <AIInsightsPanel />
              </div>
            </div>
          </>
        )}

        {activeTab === 'registry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <SectionHeader
                icon={<ClipboardList className="w-5 h-5" />}
                title="Patient Registry"
                subtitle="Active infants with care plans and assigned physicians"
              />
              <div className="space-y-3">
                {filteredRegistry.length === 0 ? (
                  <EmptyState title="No registry matches" description="Update the search to find patients." />
                ) : (
                  filteredRegistry.map((patient) => (
                    <button
                      key={patient.id}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedRegistry?.id === patient.id
                        ? 'border-purple-600/40 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-600/30'
                        }`}
                      onClick={() => setSelectedRegistryId(patient.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{patient.name}</p>
                          <p className="text-[11px] text-slate-500">ID {patient.id} • Bed {patient.bedNumber}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusPill(patient.status)}`}>
                          {patient.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Primary: {patient.doctor}</span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {patient.alerts}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              {selectedRegistry ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedRegistry.name}</h3>
                      <p className="text-xs text-slate-500">ID {selectedRegistry.id} • Bed {selectedRegistry.bedNumber}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${statusPill(selectedRegistry.status)}`}>
                      {selectedRegistry.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoCard label="Guardian" value={selectedRegistry.guardian} />
                    <InfoCard label="Admission" value={selectedRegistry.admissionDate} />
                    <InfoCard label="Primary Physician" value={selectedRegistry.doctor} />
                    <InfoCard label="Open Alerts" value={`${selectedRegistry.alerts}`} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Care Plan</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedRegistry.carePlan}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      onClick={() => router.push(`/patients/${selectedRegistry.id}`)}
                    >
                      Open Patient Profile
                    </button>
                    <button
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-600/40 transition-colors"
                      onClick={() => setActiveTab('alerts')}
                    >
                      Review Alerts
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState title="Select a patient" description="Pick a patient from the registry to view details." />
              )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <SectionHeader
              icon={<ShieldAlert className="w-5 h-5" />}
              title="Critical Alerts"
              subtitle="Triage, acknowledge, and escalate neonatal alerts"
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                {filteredAlerts.length === 0 ? (
                  <EmptyState title="No alerts found" description="Adjust your search or check back later." />
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-5 rounded-2xl border shadow-sm bg-white dark:bg-slate-900 transition-all ${alert.acknowledged
                        ? 'border-slate-200 dark:border-slate-800'
                        : 'border-red-200 dark:border-red-900/40'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${alertSeverity(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <p className="text-xs text-slate-500">{alert.time}</p>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Bed {alert.bedNumber} • {alert.patientName}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {alert.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-colors ${alert.acknowledged
                              ? 'border-emerald-500/40 text-emerald-500'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-600/40'
                              }`}
                            onClick={() =>
                              setAlerts((prev) =>
                                prev.map((item) =>
                                  item.id === alert.id ? { ...item, acknowledged: !item.acknowledged } : item
                                )
                              )
                            }
                          >
                            {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                          </button>
                          <button
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                            onClick={() => {
                              setSearchQuery(alert.bedNumber);
                              setActiveTab('dashboard');
                            }}
                          >
                            Focus Bed
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Alert Summary</h4>
                  <div className="space-y-3 text-xs text-slate-500">
                    <SummaryRow label="Unacknowledged" value={`${unacknowledgedCount}`} />
                    <SummaryRow label="Critical" value={`${alerts.filter((alert) => alert.severity === 'critical').length}`} />
                    <SummaryRow label="Warnings" value={`${alerts.filter((alert) => alert.severity === 'warning').length}`} />
                    <SummaryRow label="Info" value={`${alerts.filter((alert) => alert.severity === 'info').length}`} />
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Escalation</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Route unresolved alerts to the on-duty response team.
                  </p>
                  <button className="w-full px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
                    Escalate Unacknowledged
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <SectionHeader
                icon={<Hospital className="w-5 h-5" />}
                title="Clinical Units"
                subtitle="Operational status, staffing, and equipment readiness"
              />
              <div className="space-y-3">
                {filteredUnits.length === 0 ? (
                  <EmptyState title="No units found" description="Try searching for a unit or lead." />
                ) : (
                  filteredUnits.map((unit) => (
                    <button
                      key={unit.id}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedUnit?.id === unit.id
                        ? 'border-purple-600/40 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-600/30'
                        }`}
                      onClick={() => setSelectedUnitId(unit.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{unit.name}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${unitStatusPill(unit.status)}`}>
                          {unit.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Lead: {unit.lead}</span>
                        <span>{unit.occupancy.current}/{unit.occupancy.total} occupied</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="lg:col-span-7">
              {selectedUnit ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUnit.name}</h3>
                      <p className="text-xs text-slate-500">Lead clinician: {selectedUnit.lead}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${unitStatusPill(selectedUnit.status)}`}>
                      {selectedUnit.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard label="Occupancy" value={`${selectedUnit.occupancy.current}/${selectedUnit.occupancy.total}`} />
                    <InfoCard label="On Duty" value={`${selectedUnit.onDuty} staff`} />
                    <InfoCard label="Equipment" value={`${selectedUnit.equipment.length} systems`} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Equipment Readiness</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUnit.equipment.map((item) => (
                        <span key={item} className="text-[11px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Shift Notes</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedUnit.notes}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                      View Staffing
                    </button>
                    <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-600/40 transition-colors">
                      Open Unit Log
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState title="Select a unit" description="Choose a unit to view operational details." />
              )}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <SectionHeader
                icon={<Video className="w-5 h-5" />}
                title="Real-Time AI Monitor"
                subtitle="Connect your local camera for instant sleep analysis testing"
              />

              <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative border-4 border-slate-200 dark:border-slate-800 shadow-xl">
                {/* Video Stream */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Status Overlay */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                  {isMonitoring ? 'LIVE' : 'OFFLINE'}
                </div>
              </div>

              <div className="flex gap-4">
                {!isMonitoring ? (
                  <button
                    onClick={startMonitoring}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopMonitoring}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    Stop Camera
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center text-center h-full min-h-[300px] ${liveStatus === 'Awake' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
                liveStatus === 'Sleeping' ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' :
                  'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                }`}>

                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${liveStatus === 'Awake' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200' :
                  liveStatus === 'Sleeping' ? 'bg-rose-100 text-rose-600 dark:bg-rose-800 dark:text-rose-200' :
                    'bg-slate-200 text-slate-400 dark:bg-slate-700'
                  }`}>
                  {liveStatus === 'Awake' ? <Activity className="w-12 h-12" /> :
                    liveStatus === 'Sleeping' ? <Moon className="w-12 h-12" /> :
                      <Video className="w-12 h-12" />}
                </div>

                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 font-display">
                  {liveStatus}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  NeoCare AI is analyzing visual data points to determine infant state in real-time.
                </p>

                {isMonitoring && (
                  <div className="mt-8 w-full max-w-xs bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Temperature */}
                      <div className={`p-3 rounded-lg border ${sensorValues.tempStatus === 'Low' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        sensorValues.tempStatus === 'Moderate' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          sensorValues.tempStatus === 'High' ? 'bg-red-50 border-red-200 text-red-700' :
                            'bg-slate-50 dark:bg-slate-800 border-transparent dark:text-white'
                        }`}>
                        <span className="text-[10px] uppercase font-bold opacity-70">Temp ({sensorValues.tempStatus || '--'})</span>
                        <div className="text-xl font-bold flex items-center gap-1">
                          <Thermometer className="w-4 h-4" />
                          {typeof sensorValues.temperature === 'number' ? Number(sensorValues.temperature).toFixed(1) : '--'}°C
                        </div>
                      </div>

                      {/* Light Status */}
                      <div className={`p-3 rounded-lg border ${sensorValues.lightStatus === 'ON' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-slate-50 dark:bg-slate-800 border-transparent dark:text-gray-300'
                        }`}>
                        <span className="text-[10px] uppercase font-bold opacity-70">Light</span>
                        <div className="text-xl font-bold flex items-center gap-1">
                          <Moon className="w-4 h-4" />
                          {sensorValues.lightStatus || '--'}
                        </div>
                      </div>

                      {/* Heart Rate */}
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg col-span-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Heart Rate</span>
                        <div className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                          {typeof sensorValues.bpm === 'number' ? Number(sensorValues.bpm).toFixed(0) : '--'} BPM
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-slate-400 text-center">
                      Sensor Status: {sensorValues.status || 'Checking...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ isActive, onClick, label }: { isActive: boolean; onClick: () => void; label: string }) {
  return (
    <button
      className={`text-sm font-semibold transition-colors border-b-2 pb-1 ${isActive
        ? 'text-purple-600 border-purple-600'
        : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 border-transparent'
        }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function statusPill(status: 'stable' | 'critical' | 'observation') {
  const styles = {
    stable: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    observation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  return styles[status];
}

function unitStatusPill(status: 'stable' | 'busy' | 'critical') {
  const styles = {
    stable: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    busy: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return styles[status];
}

function alertSeverity(severity: 'critical' | 'warning' | 'info') {
  const styles = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    info: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };

  return styles[severity];
}

function EnvironmentalCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'cyan' | 'purple' | 'slate';
}) {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-500',
    purple: 'bg-purple-600/10 text-purple-600',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[160px] flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
      <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function InfantCard({ infant }: { infant: InfantData }) {
  const isCritical = infant.status === 'critical';

  const statusConfig = {
    stable: { bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', label: 'Stable Condition' },
    critical: { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Critical Alert' },
    observation: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Observation' },
  };

  const sleepConfig = {
    'deep-sleep': { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', label: 'Deep Sleep', icon: <Moon className="w-4 h-4" /> },
    'light-sleep': { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400', label: 'Light Sleep', icon: <Moon className="w-4 h-4" /> },
    'awake': { bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400', label: 'Awake', icon: <Activity className="w-4 h-4" /> },
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl p-6 border shadow-sm hover:border-purple-600/30 transition-all group relative overflow-hidden ${isCritical ? 'border-2 border-purple-600/40 shadow-xl shadow-purple-600/5' : 'border-slate-200 dark:border-slate-800'
        }`}
    >
      {isCritical && (
        <div className="absolute top-2 right-2">
          <AlertCircle className="w-4 h-4 text-purple-600 animate-pulse" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-purple-100 dark:border-purple-600/10 overflow-hidden shadow-inner bg-gradient-to-br from-purple-400 to-cyan-400"></div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Bed {infant.bedNumber} • {infant.name}</h3>
            <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide ${statusConfig[infant.status].bg}`}>
              {statusConfig[infant.status].label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-extrabold text-slate-400">
            AI SENSING <br /> <span className="text-purple-600">{infant.aiConfidence}% CONF</span>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-3 mb-6">
        <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${sleepConfig[infant.sleepState].bg}`}>
          {sleepConfig[infant.sleepState].icon}
          <span className="text-[11px] font-bold uppercase tracking-wide">{sleepConfig[infant.sleepState].label}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Timer className="w-4 h-4" />
          <span className="text-[11px] font-semibold tracking-wide">{infant.sleepDuration}</span>
        </div>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">BPM Avg</span>
          </div>
          <div className={`text-2xl font-extrabold font-display ${isCritical ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}>
            {infant.heartRate}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">SpO2 Level</span>
          </div>
          <div className={`text-2xl font-extrabold font-display ${infant.spo2 < 95 ? 'text-amber-600' : 'text-slate-800 dark:text-white'}`}>
            {infant.spo2}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Cycle Progress</span>
          <span>{infant.cycleProgress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-purple-600" style={{ width: `${infant.cycleProgress}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function AIInsightsPanel() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-600" />
        AI Insights
      </h3>
      <div className="space-y-4">
        <InsightItem
          title="Sleep Pattern Optimization"
          description="3 infants showing improved REM cycles since environmental adjustment"
          trend="positive"
          time="5 min ago"
        />
        <InsightItem
          title="Temperature Variance"
          description="Ambient temp increased by 0.3°C. AI recommends no action at this time."
          trend="neutral"
          time="12 min ago"
        />
        <InsightItem
          title="Critical Alert Resolved"
          description="Bed #02 HR normalized. Automatic notification sent to Dr. Williams."
          trend="positive"
          time="28 min ago"
        />
      </div>
      <button className="w-full mt-6 py-3 text-purple-600 text-xs font-bold border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-600 hover:bg-purple-600/5 transition-all uppercase tracking-wider flex items-center justify-center gap-2">
        View Full Log <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function InsightItem({ title, description, trend, time }: { title: string; description: string; trend: 'positive' | 'neutral' | 'negative'; time: string }) {
  const trendColors = {
    positive: 'text-emerald-500',
    neutral: 'text-slate-400',
    negative: 'text-red-500',
  };

  return (
    <div className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
        <TrendingUp className={`w-4 h-4 ${trendColors[trend]}`} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{description}</p>
      <span className="text-[10px] text-slate-400">{time}</span>
    </div>
  );
}
