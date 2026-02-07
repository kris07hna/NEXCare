/**
 * EdgeCare-5G Patient Directory Dashboard
 * Comprehensive patient management with sidebar navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, User, AlertCircle, Loader2, Users, Download,
  MoreVertical, Settings, Calendar, Activity, Bell, MessageSquare,
  LayoutDashboard, MonitorCheck, Stethoscope, UserPlus, TrendingUp, Bed
} from 'lucide-react';
import type { Patient } from '@/types';

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'discharged'>('all');
  const [patientTypeFilter, setPatientTypeFilter] = useState<'all' | 'in-patient' | 'out-patient'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    loadPatients();
  }, [statusFilter]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/patients?${params}`);
      if (!response.ok) throw new Error('Failed to load patients');

      const data = await response.json();
      setPatients(data.patients || []);
      setError(null);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    if (!searchQuery && patientTypeFilter === 'all' && departmentFilter === 'all') return true;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      patient.fullName.toLowerCase().includes(query) ||
      patient.patientId.toLowerCase().includes(query) ||
      (patient.roomId && patient.roomId.toLowerCase().includes(query));

    return matchesSearch;
  });

  const activeCount = patients.filter(p => p.status === 'active').length;
  const criticalCount = Math.floor(patients.length * 0.05); // Mock critical count

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none text-slate-900 dark:text-white">EdgeCare-5G</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Healthcare OS</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" onClick={() => router.push('/')} />
          <NavItem icon={<Users className="w-5 h-5" />} label="Patient Directory" active />
          <NavItem icon={<MonitorCheck className="w-5 h-5" />} label="Room Monitoring" />
          <NavItem icon={<Stethoscope className="w-5 h-5" />} label="Diagnostics" />
          <NavItem icon={<Calendar className="w-5 h-5" />} label="Staff Schedule" />
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => router.push('/patients/new')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all text-sm"
          >
            <Plus className="w-5 h-5" />
            New Admission
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 mt-4 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients, doctors, or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-600/50 transition-all outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <AlertCircle className="w-5 h-5" />
              Emergency Alert
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none text-slate-900 dark:text-white">Dr. Sarah Chen</p>
                <p className="text-[10px] text-slate-500">Chief Resident</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border border-slate-200 dark:border-slate-700"></div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<User className="w-6 h-6" />}
              label="Total Patients"
              value={patients.length.toString()}
              trend="+2.4%"
              trendUp
              color="blue"
            />
            <StatCard
              icon={<Bed className="w-6 h-6" />}
              label="Occupied Rooms"
              value="85%"
              trend="+5.1%"
              trendUp
              color="purple"
            />
            <StatCard
              icon={<AlertCircle className="w-6 h-6" />}
              label="Critical Alerts"
              value={criticalCount.toString()}
              trend="-1.2%"
              trendUp={false}
              color="red"
            />
          </div>

          {/* Patient Management Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Table Control Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Patient Directory</h2>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setPatientTypeFilter('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      patientTypeFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    All Patients
                  </button>
                  <button
                    onClick={() => setPatientTypeFilter('in-patient')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      patientTypeFilter === 'in-patient'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700'
                    }`}
                  >
                    In-Patient
                  </button>
                  <button
                    onClick={() => setPatientTypeFilter('out-patient')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      patientTypeFilter === 'out-patient'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Out-Patient
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold focus:ring-blue-600/50 py-2 pl-3 pr-10 text-slate-900 dark:text-white"
                >
                  <option value="all">Status: All</option>
                  <option value="active">Active</option>
                  <option value="discharged">Discharged</option>
                </select>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold focus:ring-blue-600/50 py-2 pl-3 pr-10 text-slate-900 dark:text-white"
                >
                  <option value="all">Dept: All</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="general">General</option>
                </select>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                <button 
                  onClick={() => {
                    // Export patients data as CSV
                    const csv = 'Patient ID,Name,Room,Status,Admission Date\n' + 
                      filteredPatients.map(p => 
                        `${p.id},${p.fullName},${p.roomId || 'N/A'},${p.status},${new Date(p.admissionDate).toLocaleDateString()}`
                      ).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => router.push('/patients/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Patient
                </button>
              </div>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                  <p className="mt-4 text-sm font-medium text-slate-500">Loading patients...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-16 text-center">
                <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No patients found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or add a new patient</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="px-6 py-4">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600/50" />
                      </th>
                      <th className="px-6 py-4">Patient Name</th>
                      <th className="px-6 py-4">Patient ID</th>
                      <th className="px-6 py-4">Room & Status</th>
                      <th className="px-6 py-4 text-center">Blood Type</th>
                      <th className="px-6 py-4">Admission Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPatients.map((patient, idx) => (
                      <PatientRow key={patient.id} patient={patient} index={idx} onView={() => router.push(`/patients/${patient.id}`)} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500">Showing {filteredPatients.length} of {patients.length} patients</p>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-400 disabled:opacity-50" disabled>
                  <span className="text-sm">‹</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white text-xs font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">3</button>
                <span className="text-slate-400 px-1">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {Math.ceil(patients.length / 10)}
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="text-sm">›</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Connectivity Status */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="font-semibold uppercase tracking-widest">5G Network Active:</span>
              <span className="text-green-500 font-bold">Ultra Low Latency Enabled</span>
            </div>
            <p className="text-[11px] text-slate-400">© 2024 EdgeCare-5G Patient Management Systems. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors ${
        active
          ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend, trendUp, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  color: 'blue' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-600 dark:text-blue-400',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-600 dark:text-purple-400',
    red: 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} rounded-full flex items-center justify-center ${colorClasses[color].split(' ').slice(-2).join(' ')}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
          <span className={`text-xs font-bold flex items-center ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}

function PatientRow({ patient, index, onView }: { patient: Patient; index: number; onView: () => void }) {
  const mockData = [
    { room: 'Room 402', status: 'Occupied', statusColor: 'blue', bloodType: 'A+', date: 'Oct 12, 2023', dept: 'Cardiology Dept.' },
    { room: 'ICU-08', status: 'Critical', statusColor: 'red', bloodType: 'O-', date: 'Oct 21, 2023', dept: 'Intensive Care' },
    { room: 'Out-Patient', status: 'Stable', statusColor: 'green', bloodType: 'B+', date: 'Oct 23, 2023', dept: 'Orthopedics' },
    { room: 'Room 201', status: 'Observe', statusColor: 'orange', bloodType: 'AB-', date: 'Oct 24, 2023', dept: 'Maternity' },
  ];

  const data = mockData[index % mockData.length];

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={onView}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600/50"
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{patient.fullName}</p>
            <p className="text-[11px] text-slate-500">{patient.age} yrs</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{patient.patientId}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            data.statusColor === 'blue' ? 'bg-blue-600' :
            data.statusColor === 'red' ? 'bg-red-500' :
            data.statusColor === 'green' ? 'bg-green-500' : 'bg-orange-500'
          }`}></div>
          <span className="text-sm font-medium text-slate-900 dark:text-white">{patient.roomId || data.room}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            data.statusColor === 'blue' ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20' :
            data.statusColor === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
            data.statusColor === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
          }`}>
            {data.status}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-900 dark:text-white">
          {patient.bloodType || data.bloodType}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-900 dark:text-white">{data.date}</p>
        <p className="text-[11px] text-slate-500">{data.dept}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-slate-400" />
        </button>
      </td>
    </tr>
  );
}
