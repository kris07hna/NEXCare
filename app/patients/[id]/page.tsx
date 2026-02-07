/**
 * Patient Detail Page - Premium patient profile view
 */

'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, Trash2, User, Phone, AlertCircle, Heart,
  Activity, Calendar, Droplets, Stethoscope, FileText, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PatientForm } from '@/components/patients/PatientForm';
import type { Patient, AIReport } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadPatient();
    loadReports();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) throw new Error('Patient not found');
      const data = await response.json();
      setPatient(data.patient);
      setError(null);
    } catch (err) {
      console.error('Error loading patient:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch(`/api/reports?patient_id=${patientId}&limit=20`);
      if (!response.ok) throw new Error('Failed to load reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;
    try {
      const response = await fetch(`/api/patients/${patientId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete patient');
      router.push('/patients');
    } catch (err) {
      console.error('Error deleting patient:', err);
      alert('Failed to delete patient. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-25" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <User className="h-7 w-7 animate-pulse text-indigo-600" />
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Loading patient...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-6 w-6" />
            <p className="text-lg font-bold">{error || 'Patient not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => setIsEditing(false)}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel Editing
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Patient</h1>
          <p className="mt-1 text-sm text-slate-500">Update patient information</p>
        </div>
        <PatientForm
          patient={patient}
          mode="edit"
          onSuccess={() => { setIsEditing(false); loadPatient(); }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <button
          onClick={() => router.push('/patients')}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{patient.fullName}</h1>
              <p className="mt-1 text-sm text-slate-500">
                ID: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-indigo-600">{patient.patientId}</code>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-300 shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-5 lg:grid-cols-3 stagger-children">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 flex items-center gap-2.5 text-base font-bold text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
                <User className="h-4 w-4 text-indigo-600" />
              </div>
              Basic Information
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem label="Age" value={`${patient.age} years`} />
              <InfoItem label="Gender" value={patient.gender || 'Not specified'} capitalize />
              <InfoItem label="Room" value={patient.roomId || 'Not assigned'} />
              <InfoItem label="Blood Type" value={patient.bloodType || 'Not specified'} icon={<Droplets className="h-3.5 w-3.5 text-red-400" />} />
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</div>
                <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  patient.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${patient.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {patient.status}
                </span>
              </div>
              <InfoItem label="Assigned Doctor" value={patient.doctorAssigned || 'Not assigned'} icon={<Stethoscope className="h-3.5 w-3.5 text-violet-400" />} />
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 flex items-center gap-2.5 text-base font-bold text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
                <Phone className="h-4 w-4 text-cyan-600" />
              </div>
              Contact Information
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem label="Contact Number" value={patient.contactNumber || 'Not provided'} />
              <InfoItem label="Emergency Contact" value={patient.emergencyContact || 'Not provided'} />
              {patient.emergencyPhone && (
                <InfoItem label="Emergency Phone" value={patient.emergencyPhone} />
              )}
            </div>
          </motion.div>

          {/* Medical Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 flex items-center gap-2.5 text-base font-bold text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-50 to-rose-100">
                <Heart className="h-4 w-4 text-rose-600" />
              </div>
              Medical Information
            </h3>
            <div className="space-y-4">
              {patient.allergies && (
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Allergies</div>
                  <div className="flex flex-wrap gap-1.5">
                    {JSON.parse(patient.allergies).map((a: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        <Shield className="h-3 w-3" />
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {patient.currentMedications && (
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Current Medications</div>
                  <div className="flex flex-wrap gap-1.5">
                    {JSON.parse(patient.currentMedications).map((m: string, i: number) => (
                      <span key={i} className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {patient.medicalConditions && (
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Medical Conditions</div>
                  <div className="flex flex-wrap gap-1.5">
                    {JSON.parse(patient.medicalConditions).map((c: string, i: number) => (
                      <span key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {patient.notes && (
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Additional Notes</div>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100">{patient.notes}</p>
                </div>
              )}
              {!patient.allergies && !patient.currentMedications && !patient.medicalConditions && !patient.notes && (
                <p className="text-sm text-slate-400 italic">No medical information recorded</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 flex items-center gap-2.5 text-base font-bold text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-50 to-violet-100">
                <Activity className="h-4 w-4 text-violet-600" />
              </div>
              Recent AI Reports
              {reports.length > 0 && (
                <span className="ml-auto rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-600">{reports.length}</span>
              )}
            </h3>

            {reports.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No reports available</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reports.map((report) => {
                  const alertColor = report.alertLevel === 'critical'
                    ? 'border-l-red-500 bg-red-50/50'
                    : report.alertLevel === 'warning'
                    ? 'border-l-amber-500 bg-amber-50/50'
                    : 'border-l-emerald-500 bg-slate-50/80';

                  return (
                    <div key={report.id} className={`rounded-xl border border-slate-100 border-l-[3px] p-3.5 ${alertColor}`}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">{report.module}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(report.timestamp * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">{report.status}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                            style={{ width: `${(report.confidence || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{((report.confidence || 0) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Admission Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-5 flex items-center gap-2.5 text-base font-bold text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              Admission
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Admission Date</div>
                <div className="mt-1.5 text-sm font-semibold text-slate-900">
                  {new Date(patient.admissionDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              {patient.dischargeDate && (
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Discharge Date</div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-900">
                    {new Date(patient.dischargeDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, capitalize, icon }: { label: string; value: string; capitalize?: boolean; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</div>
      <div className={`mt-1.5 text-sm font-semibold text-slate-900 flex items-center gap-1.5 ${capitalize ? 'capitalize' : ''}`}>
        {icon}
        {value}
      </div>
    </div>
  );
}
