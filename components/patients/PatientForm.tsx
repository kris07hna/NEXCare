/**
 * Patient Form Component - Premium form design
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, User, Phone, Heart, FileText } from 'lucide-react';
import type { Patient } from '@/types';

/** Safely parse a JSON array string into a comma-separated string for form display */
function safeParseArray(value: string | undefined | null): string {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(', ') : String(value);
  } catch {
    return String(value);
  }
}

interface PatientFormProps {
  patient?: Patient;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function PatientForm({ patient, mode, onSuccess }: PatientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patient_id: patient?.patient_id || '',
    full_name: patient?.full_name || '',
    age: patient?.age || '',
    gender: patient?.gender || 'male',
    room_id: patient?.room_id || '',
    contact_number: patient?.contact_number || '',
    emergency_contact: patient?.emergency_contact || '',
    emergency_phone: patient?.emergency_phone || '',
    blood_type: patient?.blood_type || '',
    allergies: safeParseArray(patient?.allergies),
    current_medications: safeParseArray(patient?.current_medications),
    medical_conditions: safeParseArray(patient?.medical_conditions),
    doctor_assigned: patient?.doctor_assigned || '',
    notes: patient?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age as string),
        allergies: formData.allergies
          ? formData.allergies.split(',').map((a: string) => a.trim())
          : [],
        current_medications: formData.current_medications
          ? formData.current_medications.split(',').map((m: string) => m.trim())
          : [],
        medical_conditions: formData.medical_conditions
          ? formData.medical_conditions.split(',').map((c: string) => c.trim())
          : [],
      };

      const url = mode === 'create' ? '/api/patients' : `/api/patients/${patient?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save patient');
      }

      const data = await response.json();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/patients/${data.patient.id}`);
      }
    } catch (err) {
      console.error('Error saving patient:', err);
      setError(err instanceof Error ? err.message : 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 stagger-children">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2.5 text-sm font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
            <User className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          Basic Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="patient_id" className={labelClass}>
              Patient ID {mode === 'create' && <span className="text-slate-400 text-xs">(Optional)</span>}
            </label>
            <input
              type="text"
              id="patient_id"
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className={inputClass}
              placeholder="P001"
              disabled={mode === 'edit'}
            />
          </div>

          <div>
            <label htmlFor="full_name" className={labelClass}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={inputClass}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="age" className={labelClass}>
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              required
              min="0"
              max="150"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className={inputClass}
              placeholder="25"
            />
          </div>

          <div>
            <label htmlFor="gender" className={labelClass}>Gender</label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
              className={inputClass}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="room_id" className={labelClass}>Room ID</label>
            <input
              type="text"
              id="room_id"
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className={inputClass}
              placeholder="R2"
            />
          </div>

          <div>
            <label htmlFor="blood_type" className={labelClass}>Blood Type</label>
            <input
              type="text"
              id="blood_type"
              value={formData.blood_type}
              onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
              className={inputClass}
              placeholder="O+"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2.5 text-sm font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
            <Phone className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          Contact Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact_number" className={labelClass}>Contact Number</label>
            <input
              type="tel"
              id="contact_number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className={inputClass}
              placeholder="+1-555-0123"
            />
          </div>

          <div>
            <label htmlFor="emergency_contact" className={labelClass}>Emergency Contact</label>
            <input
              type="text"
              id="emergency_contact"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              className={inputClass}
              placeholder="Jane Doe (Spouse)"
            />
          </div>

          <div>
            <label htmlFor="emergency_phone" className={labelClass}>Emergency Phone</label>
            <input
              type="tel"
              id="emergency_phone"
              value={formData.emergency_phone}
              onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
              className={inputClass}
              placeholder="+1-555-0124"
            />
          </div>

          <div>
            <label htmlFor="doctor_assigned" className={labelClass}>Assigned Doctor</label>
            <input
              type="text"
              id="doctor_assigned"
              value={formData.doctor_assigned}
              onChange={(e) => setFormData({ ...formData, doctor_assigned: e.target.value })}
              className={inputClass}
              placeholder="Dr. Smith"
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2.5 text-sm font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-50 to-rose-100">
            <Heart className="h-3.5 w-3.5 text-rose-600" />
          </div>
          Medical Information
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="allergies" className={labelClass}>
              Allergies <span className="text-slate-400 text-xs">(comma-separated)</span>
            </label>
            <input
              type="text"
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className={inputClass}
              placeholder="Penicillin, Latex"
            />
          </div>

          <div>
            <label htmlFor="current_medications" className={labelClass}>
              Current Medications <span className="text-slate-400 text-xs">(comma-separated)</span>
            </label>
            <textarea
              id="current_medications"
              value={formData.current_medications}
              onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
              rows={3}
              className={inputClass}
              placeholder="Aspirin 81mg, Lisinopril 10mg"
            />
          </div>

          <div>
            <label htmlFor="medical_conditions" className={labelClass}>
              Medical Conditions <span className="text-slate-400 text-xs">(comma-separated)</span>
            </label>
            <textarea
              id="medical_conditions"
              value={formData.medical_conditions}
              onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
              rows={3}
              className={inputClass}
              placeholder="Type 2 Diabetes, Hypertension"
            />
          </div>

          <div>
            <label htmlFor="notes" className={labelClass}>Additional Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className={inputClass}
              placeholder="Additional medical history or notes..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : mode === 'create' ? 'Create Patient' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
