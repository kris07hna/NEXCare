/**
 * EdgeCare-5G Hospital-Grade Monitoring Landing Page
 * Marketing & showcase page for the platform
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, PlayCircle, Brain, Zap, Shield, Activity, TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'blue' | 'purple' | 'cyan';
    link: string;
  }> = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Local AI Processing',
      description: 'Perform real-time diagnostics and predictive modeling locally on the edge node. No cloud latency means immediate life-saving decisions.',
      color: 'blue',
      link: 'Learn more',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: '5G Low Latency',
      description: 'Utilize 5G network slicing for dedicated medical bandwidth. Guaranteeing ultra-reliable connectivity in even the most congested environments.',
      color: 'purple',
      link: 'Network specs',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy-First Architecture',
      description: 'Native HIPAA and GDPR compliance. Sensitive patient PHI stays within the hospital firewall, reducing data breach risks and transit overhead.',
      color: 'cyan',
      link: 'Compliance docs',
    },
  ];

  const stats = [
    { value: '100%', label: 'On-Premise Control', description: 'Full data sovereignty' },
    { value: '500+', label: 'Active Deployments', description: 'Hospitals worldwide' },
    { value: '24/7', label: 'AI Monitoring', description: 'Never sleeps' },
    { value: '< 10ms', label: 'Alert Response', description: 'Real-time accuracy' },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600/30 antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <div className="relative">
                <div className="absolute inset-0 border-2 border-white/20 rounded"></div>
                <Activity className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-white">
              EdgeCare<span className="text-blue-600">-5G</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#features">
              Features
            </a>
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#technology">
              Technology
            </a>
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#security">
              Security
            </a>
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#pricing">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="hidden sm:block text-sm font-semibold text-white hover:text-blue-600 transition-colors px-4 py-2"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/onboarding')}
              className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95"
            >
              Launch Edge Server
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Background Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15)_0%,rgba(10,12,16,0)_70%)]"></div>
          </div>
          <div className="absolute top-1/4 -right-20 h-[500px] w-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-20"></div>
          <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-20"></div>

          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              {/* Left Column */}
              <div className="flex flex-col gap-8">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 border border-blue-600/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    Next-Gen Healthcare
                  </span>
                  <h1 className="mt-6 font-display text-5xl font-black leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
                    Hospital-Grade <br />
                    <span className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                      Monitoring. Anywhere.
                    </span>
                  </h1>
                  <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-400">
                    Leverage the power of 5G and Local AI to deliver critical patient insights in milliseconds, not minutes. Secure, decentralized, and mission-ready.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-blue-600/30 flex items-center gap-2 group transition-all"
                  >
                    Launch Edge Server
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 transition-all">
                    <PlayCircle className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-6 border-t border-white/5 pt-8">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">5ms</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Latency</span>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">99.9%</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Reliability</span>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">AES-256</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Encryption</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Preview Card */}
              <div className="relative lg:block">
                <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent"></div>
                  <div className="aspect-square w-full bg-gradient-to-br from-slate-800 to-slate-900 p-8">
                    {/* Mock Dashboard Preview */}
                    <div className="h-full w-full rounded-2xl border border-white/10 bg-slate-950/50 p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Monitor</div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-xs text-green-400 font-medium">Active</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <div className="bg-slate-900/50 rounded-xl border border-white/5 p-4">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Heart Rate</div>
                          <div className="text-2xl font-bold text-white">72 <span className="text-sm text-slate-400">BPM</span></div>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl border border-white/5 p-4">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">SpO2</div>
                          <div className="text-2xl font-bold text-emerald-400">98<span className="text-sm text-slate-400">%</span></div>
                        </div>
                        <div className="col-span-2 bg-blue-600/10 rounded-xl border border-blue-600/20 p-4">
                          <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-2">AI Status</div>
                          <div className="text-sm font-semibold text-white">All systems nominal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating Cards */}
                  <div className="absolute top-6 left-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heart Rate</p>
                        <p className="text-xl font-bold text-white">72 BPM</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-6 right-6 bg-white/5 backdrop-blur-md border border-blue-600/30 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-semibold text-white">Edge Node: Active</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-blue-600/20 blur-3xl -z-10 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-[#0c0f14]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 flex flex-col items-center text-center">
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Engineered for Critical Performance</h2>
              <p className="mt-4 max-w-2xl text-slate-400">
                Our decentralized architecture moves processing power to the network edge, ensuring patient data is handled with zero-trust security and maximum speed.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, idx) => (
                <FeatureCard key={idx} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-t border-white/5 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {stats.map((stat, idx) => (
                <div key={idx} className="border-l-2 border-blue-600/50 pl-6">
                  <p className="text-4xl font-black text-white">{stat.value}</p>
                  <p className="mt-2 text-base font-bold text-slate-300">{stat.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-display text-4xl font-black text-white md:text-5xl">
              Ready to Transform Patient Care?
            </h2>
            <p className="mt-6 text-lg text-blue-100">
              Join hundreds of hospitals leveraging edge AI and 5G for life-saving insights.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push('/onboarding')}
                className="bg-white hover:bg-slate-100 text-blue-600 px-10 py-4 rounded-xl text-lg font-bold shadow-2xl transition-all active:scale-95"
              >
                Get Started Free
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-slate-950 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="font-display text-xl font-extrabold text-white">
                  EdgeCare<span className="text-blue-600">-5G</span>
                </span>
              </div>
              <p className="text-sm text-slate-500">© 2024 EdgeCare-5G. All rights reserved. HIPAA & GDPR Compliant.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, link }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'cyan';
  link: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-600/10 text-blue-600 hover:border-blue-600/50 group-hover:text-blue-600',
    purple: 'bg-purple-600/10 text-purple-600 hover:border-purple-600/50 group-hover:text-purple-600',
    cyan: 'bg-cyan-400/10 text-cyan-400 hover:border-cyan-400/50 group-hover:text-cyan-400',
  };

  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all hover:-translate-y-2 hover:border-opacity-50">
      <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} shadow-inner`}>
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      <p className="mt-4 leading-relaxed text-slate-400">{description}</p>
      <div className={`mt-6 flex items-center gap-2 text-sm font-bold opacity-0 transition-all ${colorClasses[color].split('group-hover:')[1]}`}>
        {link} <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}
