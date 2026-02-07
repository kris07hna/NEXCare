/**
 * EdgeCare-5G Create New Patient
 * Comprehensive patient admission form with multiple sections
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, User, Phone, FileText, X, Check, Cloud, Heart,
  Mail, MapPin, Plus, AlertTriangle
} from 'lucide-react';

export default function NewPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    bloodType: 'A+',
    phone: '',
    email: '',
    address: '',
    allergies: ['Peanuts', 'Penicillin'],
    roomId: '',
    emergencyLevel: 'priority',
    medicalHistory: '',
  });
  const [emailError, setEmailError] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  const handleSubmit = async() => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId: `#PT-${Math.floor(Math.random() * 90000) + 10000}`,
          status: 'active',
          allergies: JSON.stringify(formData.allergies),
        }),
      });

      if (!response.ok) throw new Error('Failed to create patient');
      router.push('/patients');
    } catch (err) {
      console.error('Error creating patient:', err);
      alert('Failed to create patient. Please try again.');
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({ ...formData, allergies: [...formData.allergies, newAllergy.trim()] });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData({ ...formData, allergies: formData.allergies.filter((_, i) => i !== index) });
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Navigation Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-600/10 rounded-lg">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">EdgeCare-5G</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors" href="/">Dashboard</a>
            <a className="text-blue-600 text-sm font-semibold border-b-2 border-blue-600 pb-0.5" href="/patients">Patients</a>
            <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors" href="#">Staff</a>
            <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors" href="#">Rooms</a>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <label className="flex flex-col min-w-40 h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-slate-400 flex bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 rounded-r-lg text-slate-900 dark:text-white border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600/50 h-full placeholder:text-slate-400 px-4 text-sm"
                placeholder="Search patients..."
              />
            </div>
          </label>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-blue-600/20"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-5xl px-6 py-8">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <a className="hover:text-blue-600 transition-colors" href="/">Home</a>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
              <a className="hover:text-blue-600 transition-colors" href="/patients">Patients</a>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
              <span className="text-slate-900 dark:text-white">New Patient</span>
            </div>
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div className="space-y-1">
                <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">Create New Patient</h1>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <Cloud className="w-4 h-4 text-green-500" />
                  <span>Draft Saved at 10:45 AM via 5G High-Speed Sync</span>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </button>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-8">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-slate-900 dark:text-white text-xl font-bold">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Full Name</span>
                  <div className="relative">
                    <input
                      className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                      placeholder="John Doe"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                    {formData.fullName && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Age</span>
                  <input
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 dark:text-white"
                    placeholder="28"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Gender</span>
                  <select
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 dark:text-white appearance-none"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <div className="flex flex-col gap-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Blood Type</span>
                  <div className="grid grid-cols-4 gap-2">
                    {bloodTypes.slice(0, 4).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, bloodType: type })}
                        className={`h-10 border rounded-lg font-bold transition-colors ${
                          formData.bloodType === type
                            ? 'border-blue-600 bg-blue-600/10 text-blue-600'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {bloodTypes.slice(4).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, bloodType: type })}
                        className={`h-10 border rounded-lg font-bold transition-colors ${
                          formData.bloodType === type
                            ? 'border-blue-600 bg-blue-600/10 text-blue-600'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Phone className="w-5 h-5 text-blue-600" />
                <h2 className="text-slate-900 dark:text-white text-xl font-bold">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Phone Number</span>
                  <input
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 dark:text-white"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Email Address</span>
                  <div className="relative">
                    <input
                      className={`w-full h-12 border rounded-lg px-4 focus:ring-2 focus:border-transparent transition-all outline-none ${
                        emailError
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-900 focus:ring-red-500/50'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-blue-600'
                      } text-slate-900 dark:text-white`}
                      placeholder="john.doe@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setEmailError(!e.target.value.includes('@'));
                      }}
                    />
                    {emailError && <p className="mt-1 text-xs text-red-500 font-medium">Please enter a valid email address</p>}
                  </div>
                </label>
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Home Address</span>
                  <input
                    className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 dark:text-white"
                    placeholder="123 Medical Plaza, High Tech District"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </label>
              </div>
            </div>

            {/* Medical Information Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-slate-900 dark:text-white text-xl font-bold">Medical Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Allergies</span>
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg min-h-12">
                    {formData.allergies.map((allergy, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs font-bold uppercase">
                        {allergy}
                        <X className="w-3 h-3 cursor-pointer hover:text-red-900" onClick={() => removeAllergy(i)} />
                      </span>
                    ))}
                    <input
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 min-w-[150px] text-slate-900 dark:text-white placeholder:text-slate-400"
                      placeholder="Type and press enter..."
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAllergy();
                        }
                      }}
                    />
                  </div>
                </div>
                <label className="flex flex-col gap-2 md:col-span-1">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Room Assignment</span>
                  <div className="relative">
                    <select
                      className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 dark:text-white appearance-none"
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    >
                      <option value="">Select Available Room</option>
                      <option value="room-402">Room 402 (Standard)</option>
                      <option value="room-501">Room 501 (ICU)</option>
                      <option value="room-102">Room 102 (Emergency)</option>
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </label>
                <label className="flex flex-col gap-2 md:col-span-1">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Emergency Level</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, emergencyLevel: 'normal' })}
                      className={`flex-1 h-12 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        formData.emergencyLevel === 'normal'
                          ? 'border-2 border-slate-400 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 bg-slate-300 rounded-full"></span> Normal
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, emergencyLevel: 'priority' })}
                      className={`flex-1 h-12 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        formData.emergencyLevel === 'priority'
                          ? 'border-2 border-blue-600 bg-blue-600/5 text-blue-600 font-bold'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Priority
                    </button>
                  </div>
                </label>
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Medical History & Notes</span>
                  <textarea
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 dark:text-white resize-none"
                    placeholder="Patient background, chronic conditions, and recent symptoms..."
                    rows={4}
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  ></textarea>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Action Footer */}
      <footer className="sticky bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-10 py-6 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
            <Cloud className="w-5 h-5 text-blue-600" />
            <span>Auto-sync enabled via Edge-5G</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Patient
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
