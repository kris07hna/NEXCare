/**
 * Login Page - Role-based Authentication
 * Redirects users to their specific dashboards based on role
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, User, Lock, Monitor, Stethoscope, Baby,
  HeartPulse, AlertCircle, Eye, EyeOff
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  icon: React.ReactNode;
  dashboard: string;
  description: string;
  color: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles: Role[] = [
    {
      id: 'master',
      name: 'Master Control',
      icon: <Monitor className="w-6 h-6" />,
      dashboard: '/',
      description: 'Full system access and monitoring',
      color: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'doctor',
      name: 'Doctor',
      icon: <Stethoscope className="w-6 h-6" />,
      dashboard: '/consultations',
      description: 'Patient consultations and care',
      color: 'from-purple-600 to-pink-500'
    },
    {
      id: 'neocare',
      name: 'NeoCare Specialist',
      icon: <Baby className="w-6 h-6" />,
      dashboard: '/neocare',
      description: 'Neonatal intensive care monitoring',
      color: 'from-indigo-600 to-blue-500'
    },
    {
      id: 'gericare',
      name: 'GeriCare Monitor',
      icon: <HeartPulse className="w-6 h-6" />,
      dashboard: '/gericare',
      description: 'Fall detection and elderly care',
      color: 'from-pink-600 to-rose-500'
    },
    {
      id: 'roommonitor',
      name: 'Room Monitor',
      icon: <AlertCircle className="w-6 h-6" />,
      dashboard: '/room-monitoring',
      description: 'Live patient room monitoring',
      color: 'from-emerald-600 to-teal-500'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (!username || !password) {
        setError('Please enter username and password');
        setLoading(false);
        return;
      }

      if (!selectedRole) {
        setError('Please select your role');
        setLoading(false);
        return;
      }

      // Demo credentials (in production, this would call an API)
      const validCredentials = {
        master: { username: 'admin', password: 'admin123' },
        doctor: { username: 'doctor', password: 'doctor123' },
        neocare: { username: 'neocare', password: 'neo123' },
        gericare: { username: 'gericare', password: 'geri123' },
        roommonitor: { username: 'monitor', password: 'monitor123' }
      };

      const roleCredentials = validCredentials[selectedRole as keyof typeof validCredentials];
      
      if (username === roleCredentials?.username && password === roleCredentials?.password) {
        // Store session (in production, use proper auth tokens)
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('username', username);
        
        // Redirect to role-specific dashboard
        const role = roles.find(r => r.id === selectedRole);
        router.push(role?.dashboard || '/');
      } else {
        setError('Invalid credentials. Try: username & password for your role');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                  EdgeCare<span className="text-blue-600">-5G</span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  AI Healthcare Monitoring Platform
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Real-time Monitoring
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  5G-powered instant patient data with AI-driven insights
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Critical Alerts
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Fall detection and emergency response automation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                <Baby className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Specialized Care
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Dedicated modules for neonatal and geriatric care
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © 2026 EdgeCare-5G. Secure healthcare platform with 99.9% uptime.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to access your healthcare dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedRole === role.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center text-white mb-2`}>
                        {role.icon}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {role.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {role.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Demo Credentials */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                  Demo Credentials:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Master: admin / admin123</li>
                  <li>• Doctor: doctor / doctor123</li>
                  <li>• NeoCare: neocare / neo123</li>
                  <li>• GeriCare: gericare / geri123</li>
                  <li>• Monitor: monitor / monitor123</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              EdgeCare-5G AI Healthcare Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
