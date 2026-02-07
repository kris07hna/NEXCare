/**
 * NeoCare Components - Part 2
 * Registry, Alerts, Units Views and Modals
 */

import {
  AlertCircle,
  Download,
  Plus,
  User,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Moon,
  Activity,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { InfantData } from './page';

// Critical Alert Banner
export function CriticalAlertBanner({ infants, onView }: any) {
  if (infants.length === 0) return null;

  const criticalInfant = infants[0];

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 px-6 py-3">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600 w-5 h-5 animate-pulse" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-400">
            <span className="font-extrabold uppercase mr-2 tracking-wide text-[10px] bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">
              CRITICAL
            </span>
            {criticalInfant.name} (Bed #{criticalInfant.bedNumber}) - AI Confidence: {criticalInfant.aiConfidence}%
          </p>
        </div>
        <button
          onClick={() => onView(criticalInfant)}
          className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/50 px-4 py-2 rounded transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// Infant Monitor Card
export function InfantMonitorCard({ infant, onView }: { infant: InfantData; onView: () => void }) {
  const isCritical = infant.status === 'critical';

  const statusConfig = {
    stable: { bg: 'bg-cyan-500/10 text-cyan-600', label: 'Stable' },
    critical: { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Critical' },
    observation: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Watch' },
  };

  const sleepConfig = {
    'deep-sleep': { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30', label: 'Deep Sleep', icon: <Moon className="w-3.5 h-3.5" /> },
    'light-sleep': { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30', label: 'Light Sleep', icon: <Moon className="w-3.5 h-3.5" /> },
    'awake': { bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30', label: 'Awake', icon: <Activity className="w-3.5 h-3.5" /> },
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isCritical ? 'border-2 border-red-500/50 shadow-red-500/10' : 'border-slate-200 dark:border-slate-800'
      }`}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Bed {infant.bedNumber}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{infant.name}</p>
          <p className="text-xs text-slate-500">{infant.patientId}</p>
        </div>
        <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase ${statusConfig[infant.status].bg}`}>
          {statusConfig[infant.status].label}
        </span>
      </div>

      {/* Sleep State */}
      <div className={`px-3 py-2 rounded-lg flex items-center gap-2 mb-4 ${sleepConfig[infant.sleepState].bg}`}>
        {sleepConfig[infant.sleepState].icon}
        <span className="text-[11px] font-semibold">{sleepConfig[infant.sleepState].label}</span>
        <span className="text-[11px] ml-auto">{infant.sleepDuration}</span>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-[10px] text-slate-500 mb-1">HR</div>
          <div className={`text-xl font-bold ${isCritical ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
            {infant.heartRate}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 mb-1">SpO2</div>
          <div className={`text-xl font-bold ${infant.spo2 < 95 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
            {infant.spo2}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 mb-1">Temp</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {infant.temperature.toFixed(1)}°
          </div>
        </div>
      </div>

      {/* AI Confidence */}
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>AI Confidence</span>
        <span className="font-semibold text-purple-600">{infant.aiConfidence}%</span>
      </div>
    </div>
  );
}

// Registry View
export function RegistryView({ infants, onViewPatient, onDeletePatient, onExport }: any) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Patient Registry</h2>
          <p className="text-sm text-slate-500">{infants.length} active patients</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button
            onClick={() => window.location.href = '/patients/new'}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Patient ID</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Name</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Bed</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Vitals</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Doctor</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {infants.map((infant: InfantData) => (
              <tr key={infant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 text-sm font-medium">{infant.patientId}</td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-sm">{infant.name}</div>
                    <div className="text-xs text-slate-500">{infant.age} months old</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">Bed {infant.bedNumber}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    infant.status === 'critical' ? 'bg-red-100 text-red-700' :
                    infant.status === 'observation' ? 'bg-amber-100 text-amber-700' :
                    'bg-cyan-100 text-cyan-700'
                  }`}>
                    {infant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-3 text-xs">
                    <span>HR: {infant.heartRate}</span>
                    <span>SpO2: {infant.spo2}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{infant.doctorAssigned}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewPatient(infant)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                      title="View Details"
                    >
                      <User className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => window.location.href = `/patients/${infant.id}`}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => onDeletePatient(infant.id, infant.patientId)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Alerts View
export function AlertsView({ infants, onAcknowledge, onViewPatient }: any) {
  const criticalInfants = infants.filter((i: InfantData) => i.status === 'critical');
  const observationInfants = infants.filter((i: InfantData) => i.status === 'observation');

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Critical Alerts</h2>
        <p className="text-sm text-slate-500">Monitoring {criticalInfants.length} critical and {observationInfants.length} observation cases</p>
      </div>

      <div className="space-y-6">
        {/* Critical Alerts */}
        {criticalInfants.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical ({criticalInfants.length})
            </h3>
            <div className="space-y-3">
              {criticalInfants.map((infant: InfantData) => (
                <AlertCard
                  key={infant.id}
                  infant={infant}
                  severity="critical"
                  onAcknowledge={() => onAcknowledge(infant.id)}
                  onView={() => onViewPatient(infant)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Observation Alerts */}
        {observationInfants.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Observation ({observationInfants.length})
            </h3>
            <div className="space-y-3">
              {observationInfants.map((infant: InfantData) => (
                <AlertCard
                  key={infant.id}
                  infant={infant}
                  severity="warning"
                  onAcknowledge={() => onAcknowledge(infant.id)}
                  onView={() => onViewPatient(infant)}
                />
              ))}
            </div>
          </div>
        )}

        {criticalInfants.length === 0 && observationInfants.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-semibold text-slate-600">All Patients Stable</p>
            <p className="text-sm text-slate-500 mt-2">No critical or observation alerts at this time</p>
          </div>
        )}
      </div>
    </>
  );
}

// Alert Card
export function AlertCard({ infant, severity, onAcknowledge, onView }: any) {
  const bgColor = severity === 'critical' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50';
  const textColor = severity === 'critical' ? 'text-red-900 dark:text-red-400' : 'text-amber-900 dark:text-amber-400';

  return (
    <div className={`p-4 rounded-lg border ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`font-bold ${textColor}`}>{infant.name}</span>
            <span className="text-sm text-slate-600">Bed {infant.bedNumber}</span>
            <span className="text-xs text-slate-500">{infant.patientId}</span>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
            <div>
              <span className="text-slate-500">Heart Rate:</span>
              <span className={`ml-2 font-semibold ${infant.heartRate > 150 ? 'text-red-600' : ''}`}>
                {infant.heartRate} bpm
              </span>
            </div>
            <div>
              <span className="text-slate-500">SpO2:</span>
              <span className={`ml-2 font-semibold ${infant.spo2 < 95 ? 'text-red-600' : ''}`}>
                {infant.spo2}%
              </span>
            </div>
            <div>
              <span className="text-slate-500">Temp:</span>
              <span className="ml-2 font-semibold">{infant.temperature.toFixed(1)}°C</span>
            </div>
            <div>
              <span className="text-slate-500">Alerts:</span>
              <span className="ml-2 font-semibold text-red-600">{infant.alertCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock className="w-3 h-3" />
            <span>Last update: {new Date(infant.lastUpdate).toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            View Details
          </button>
          <button
            onClick={onAcknowledge}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}

// Clinical Units View
// Clinical Units View
export function ClinicalUnitsView({ clinicalUnits, infants }: any) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Clinical Units</h2>
        <p className="text-sm text-slate-500">Neonatal care unit organization and capacity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clinicalUnits.filter((u: any) => u.id !== 'all').map((unit: any) => {
          const unitInfants = infants.filter((i: InfantData) => unit.beds.includes(i.roomId));
          const criticalCount = unitInfants.filter((i: InfantData) => i.status === 'critical').length;
          const occupancy = (unitInfants.length / unit.beds.length) * 100;

          return (
            <div key={unit.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{unit.name}</h3>
                  <p className="text-sm text-slate-500">Beds: {unit.beds.join(', ')}</p>
                </div>
                {criticalCount > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-semibold">
                    {criticalCount} Critical
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Occupancy</span>
                    <span className="font-semibold">{unitInfants.length} / {unit.beds.length} beds</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${occupancy > 80 ? 'bg-red-500' : occupancy > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${occupancy}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                    <div className="text-slate-500 mb-1">Stable</div>
                    <div className="text-2xl font-bold text-green-600">
                      {unitInfants.filter((i: InfantData) => i.status === 'stable').length}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                    <div className="text-slate-500 mb-1">Observation</div>
                    <div className="text-2xl font-bold text-amber-600">
                      {unitInfants.filter((i: InfantData) => i.status === 'observation').length}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-sm mb-2">Patients</h4>
                  {unitInfants.length > 0 ? (
                    <div className="space-y-2">
                      {unitInfants.map((infant: InfantData) => (
                        <div key={infant.id} className="flex justify-between items-center text-sm">
                          <span>{infant.name}</span>
                          <span className="text-slate-500">Bed {infant.bedNumber}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No patients assigned</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Patient Detail Modal
// Patient Detail Modal
export function PatientDetailModal({ infant, onClose }: { infant: InfantData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{infant.name}</h2>
            <p className="text-slate-500">{infant.patientId} • Bed {infant.bedNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Status</div>
              <div className={`text-lg font-bold capitalize ${
                infant.status === 'critical' ? 'text-red-600' :
                infant.status === 'observation' ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {infant.status}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Heart Rate</div>
              <div className="text-lg font-bold">{infant.heartRate} bpm</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">SpO2</div>
              <div className="text-lg font-bold">{infant.spo2}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Temperature</div>
              <div className="text-lg font-bold">{infant.temperature.toFixed(1)}°C</div>
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <h3 className="font-semibold mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Age:</span>
                <span className="ml-2 font-medium">{infant.age} months</span>
              </div>
              <div>
                <span className="text-slate-500">Admission Date:</span>
                <span className="ml-2 font-medium">{new Date(infant.admissionDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500">Doctor:</span>
                <span className="ml-2 font-medium">{infant.doctorAssigned}</span>
              </div>
              <div>
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="ml-2 font-medium">{infant.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="font-semibold mb-3">Medical Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-500">Allergies:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {infant.allergies.length > 0 ? (
                    infant.allergies.map((allergy: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">None</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm text-slate-500">Medical Conditions:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {infant.medicalConditions.length > 0 ? (
                    infant.medicalConditions.map((condition: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {condition}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Monitoring */}
          <div>
            <h3 className="font-semibold mb-3">AI Monitoring</h3>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">AI Confidence Level</span>
                <span className="text-lg font-bold text-purple-600">{infant.aiConfidence}%</span>
              </div>
              <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2">
                <div className="h-2 rounded-full bg-purple-600" style={{ width: `${infant.aiConfidence}%` }}></div>
              </div>
              <div className="mt-3 text-sm text-slate-600">
                <div>Sleep State: <span className="font-medium capitalize">{infant.sleepState.replace('-', ' ')}</span></div>
                <div>Sleep Duration: <span className="font-medium">{infant.sleepDuration}</span></div>
                <div>Total Alerts: <span className="font-medium text-red-600">{infant.alertCount}</span></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => window.location.href = `/patients/${infant.id}`}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Edit Patient Record
            </button>
            <button
              onClick={() => window.location.href = `/consultation/${infant.roomId}`}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Start Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
