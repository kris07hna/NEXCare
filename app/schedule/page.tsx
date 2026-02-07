/**
 * Staff Schedule Management
 * View and manage medical staff schedules and shifts
 */

'use client';

import { useRouter } from 'next/navigation';
import {
  Calendar, Clock, Users, UserPlus, Filter, Download,
  ChevronLeft, ChevronRight, ArrowLeft,
  CheckCircle, AlertCircle
} from 'lucide-react';

export default function StaffSchedulePage() {
  const router = useRouter();

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const staffSchedule = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Physician',
      avatar: '👩‍⚕️',
      shifts: {
        Mon: ['Morning', 'Afternoon'],
        Tue: ['Morning'],
        Wed: ['Morning', 'Afternoon'],
        Thu: ['Morning'],
        Fri: ['Morning', 'Afternoon'],
        Sat: [],
        Sun: [],
      },
    },
    {
      name: 'Dr. Michael Rodriguez',
      role: 'Geriatric Specialist',
      avatar: '👨‍⚕️',
      shifts: {
        Mon: ['Afternoon', 'Night'],
        Tue: ['Night'],
        Wed: ['Afternoon', 'Night'],
        Thu: ['Night'],
        Fri: ['Afternoon'],
        Sat: ['Morning'],
        Sun: [],
      },
    },
    {
      name: 'Nurse Emily Johnson',
      role: 'Head Nurse',
      avatar: '👩‍⚕️',
      shifts: {
        Mon: ['Morning'],
        Tue: ['Morning', 'Afternoon'],
        Wed: ['Morning'],
        Thu: ['Morning', 'Afternoon'],
        Fri: ['Morning'],
        Sat: ['Morning', 'Afternoon'],
        Sun: ['Morning'],
      },
    },
    {
      name: 'Dr. James Wilson',
      role: 'Neonatologist',
      avatar: '👨‍⚕️',
      shifts: {
        Mon: ['Night'],
        Tue: ['Afternoon', 'Night'],
        Wed: ['Night'],
        Thu: ['Afternoon', 'Night'],
        Fri: ['Night'],
        Sat: ['Afternoon', 'Night'],
        Sun: ['Night'],
      },
    },
  ];

  const upcomingShifts = [
    { staff: 'Dr. Sarah Chen', time: 'Today 8:00 AM - 4:00 PM', status: 'ongoing', department: 'General' },
    { staff: 'Nurse Emily Johnson', time: 'Today 8:00 AM - 12:00 PM', status: 'ongoing', department: 'NeoCare' },
    { staff: 'Dr. Michael Rodriguez', time: 'Today 4:00 PM - 12:00 AM', status: 'upcoming', department: 'GeriCare' },
    { staff: 'Dr. James Wilson', time: 'Today 12:00 AM - 8:00 AM', status: 'upcoming', department: 'NeoCare' },
  ];

  const shiftColors = {
    Morning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Afternoon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Night: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Staff Schedule</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage medical staff shifts & availability</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-semibold">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-semibold">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-semibold">Add Staff</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Staff</p>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">24</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">On Duty</p>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">8</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Off Duty</p>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">16</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vacancies</p>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">2</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Weekly Schedule
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-semibold text-sm">
                  Week of Feb 7, 2026
                </span>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Staff Member
                    </th>
                    {weekDays.map(day => (
                      <th key={day} className="px-3 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {staffSchedule.map((staff, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{staff.avatar}</span>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{staff.name}</p>
                            <p className="text-xs text-slate-400">{staff.role}</p>
                          </div>
                        </div>
                      </td>
                      {weekDays.map(day => (
                        <td key={day} className="px-2 py-4">
                          <div className="flex flex-col gap-1">
                            {staff.shifts[day as keyof typeof staff.shifts].map((shift, i) => (
                              <span
                                key={i}
                                className={`text-[10px] font-bold px-2 py-1 rounded text-center ${
                                  shiftColors[shift as keyof typeof shiftColors]
                                }`}
                              >
                                {shift.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Shifts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Today&apos;s Shifts
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {upcomingShifts.map((shift, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{shift.staff}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      shift.status === 'ongoing'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                    }`}>
                      {shift.status === 'ongoing' ? 'ACTIVE' : 'UPCOMING'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{shift.time}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{shift.department}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
