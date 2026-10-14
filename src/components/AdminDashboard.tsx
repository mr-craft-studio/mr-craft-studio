import React, { useState, useEffect } from 'react';
import {
  X, Lock, LogOut, CheckCircle, AlertTriangle, FileSpreadsheet,
  Search, Plus, Trash2, Edit3, Save, RefreshCw, Layers, Calendar,
  DollarSign, Settings, Users, Phone, Mail, Globe, ArrowRight, Shield, Key
} from 'lucide-react';
import type { WebsiteSettings, ServiceItem, PortfolioProject, Booking, LeadInquiry } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: (newSettings: WebsiteSettings) => void;
  onDataRefreshNeeded: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
  onDataRefreshNeeded,
}) => {
  // Auth state
  const [token, setToken] = useState<string>(() => localStorage.getItem('mr_craft_admin_token') || '');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'services' | 'portfolio' | 'settings' | 'leads' | 'security'>('overview');

  // Password management state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isExportingCSV, setIsExportingCSV] = useState<boolean>(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [inquiries, setInquiries] = useState<LeadInquiry[]>([]);
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings | null>(null);

  // Filters & Search
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Editing modals/drawers
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false);
  const [webhookTestResult, setWebhookTestResult] = useState<string>('');

  // Fetch all dashboard data when token is valid and modal is open
  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) setStats(await statsRes.json());
      else if (statsRes.status === 401 || statsRes.status === 403) {
        handleLogout();
        return;
      }

      // Bookings
      const bookingsRes = await fetch('/api/admin/bookings', { headers });
      if (bookingsRes.ok) setBookings(await bookingsRes.json());

      // Services
      const servicesRes = await fetch('/api/admin/services', { headers });
      if (servicesRes.ok) setServices(await servicesRes.json());

      // Portfolio
      const portfolioRes = await fetch('/api/admin/portfolio', { headers });
      if (portfolioRes.ok) setPortfolio(await portfolioRes.json());

      // Inquiries
      const inqRes = await fetch('/api/admin/inquiries', { headers });
      if (inqRes.ok) setInquiries(await inqRes.json());

      // Settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) setSettingsForm(await settingsRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  // Verify session validity with backend on mount
  useEffect(() => {
    if (isOpen && token) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            handleLogout();
          } else {
            res.json().then(data => {
              if (data.expiresAt) setSessionExpiresAt(data.expiresAt);
            });
            fetchDashboardData();
          }
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication rejected');

      setToken(data.token);
      localStorage.setItem('mr_craft_admin_token', data.token);
      if (data.expiresAt) setSessionExpiresAt(data.expiresAt);
      setPasswordInput('');
    } catch (err: any) {
      setLoginError(err.message || 'Incorrect password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken('');
    setSessionExpiresAt(null);
    localStorage.removeItem('mr_craft_admin_token');
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus('');
    setPasswordChangeError('');

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update administrator password');

      setPasswordChangeStatus('Administrator password successfully updated and securely hashed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showStatus('Admin credentials updated');
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Error updating password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking record?')) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showStatus('Booking removed');
        if (selectedBooking?.id === id) setSelectedBooking(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Booking Status / Slot / Admin Notes
  const handleUpdateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showStatus('Booking successfully updated');
        fetchDashboardData();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, ...updates });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export Bookings CSV (Secure in-memory blob download)
  const handleExportCSV = async () => {
    if (!token) return;
    setIsExportingCSV(true);
    try {
      const res = await fetch('/api/admin/bookings/export-csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download CSV export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mr-craft-bookings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus('Bookings CSV exported');
    } catch (err: any) {
      showStatus('Export failed: ' + err.message);
    } finally {
      setIsExportingCSV(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettingsForm(updated);
        onSettingsUpdated(updated);
        showStatus('Website settings saved successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Service
  const handleSaveService = async (service: ServiceItem) => {
    try {
      const isNew = !services.some(s => s.id === service.id);
      const url = isNew ? '/api/admin/services' : `/api/admin/services/${service.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(service),
      });

      if (res.ok) {
        setEditingService(null);
        showStatus('Service saved');
        fetchDashboardData();
        onDataRefreshNeeded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showStatus('Service removed');
        fetchDashboardData();
        onDataRefreshNeeded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Portfolio Project
  const handleSaveProject = async (project: PortfolioProject) => {
    try {
      const isNew = !portfolio.some(p => p.id === project.id);
      const url = isNew ? '/api/admin/portfolio' : `/api/admin/portfolio/${project.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(project),
      });

      if (res.ok) {
        setEditingProject(null);
        showStatus('Portfolio project saved');
        fetchDashboardData();
        onDataRefreshNeeded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Portfolio Project
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showStatus('Project deleted');
        fetchDashboardData();
        onDataRefreshNeeded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Lead / Inquiry Status
  const handleUpdateInquiry = async (id: string, updates: Partial<LeadInquiry>) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showStatus('Inquiry updated');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Test Server-Side Webhook Alert
  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookTestResult('');
    try {
      const res = await fetch('/api/admin/test-webhook', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWebhookTestResult(data.message || (data.success ? 'Webhook test succeeded' : 'Webhook test failed'));
      showStatus(data.success ? 'Webhook transmitted' : 'Webhook test issue');
    } catch (err: any) {
      setWebhookTestResult('Error sending test webhook: ' + err.message);
    } finally {
      setTestingWebhook(false);
    }
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingFilter === 'all' || b.status === bookingFilter;
    const matchesSearch =
      bookingSearch === '' ||
      b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.email.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-6xl bg-[#130e09] border border-white/20 shadow-2xl flex flex-col h-[94vh] max-h-[94vh] overflow-hidden">
        
        {/* Top Bar */}
        <div className="p-4 sm:p-5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-[#130e09] font-mono font-bold flex items-center justify-center text-xs">
              MC
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                MR. CRAFT STUDIO — PRIVATE OWNER CONSOLE
              </h2>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                Owner Direct Operations & Database Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-colors uppercase font-mono"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white border border-white/10"
              aria-label="Close Admin Console"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Temporary Status Toast */}
        {statusMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 1. AUTH SCREEN (If no token) */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md atelier-glass p-8 border border-white/20 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Lock size={20} />
              </div>

              <h3 className="text-xl font-bold uppercase text-white mb-2 tracking-wide">
                Restricted Administrator Access
              </h3>
              <p className="text-xs text-white/60 mb-6 font-light">
                Please authenticate using your MR. CRAFT STUDIO administrator credentials. All dashboard routes, client bookings, and database operations are cryptographically protected.
              </p>

              {loginError && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter administrator password..."
                    className="w-full p-3 bg-white/[0.04] border border-white/20 text-white text-xs placeholder:text-white/30 focus:border-white focus:outline-none font-mono"
                  />
                  <div className="flex items-center justify-between text-[10px] text-white/40 mt-1.5 font-mono">
                    <span>Default initial: mrcraft2026!</span>
                    <span>Protected by Scrypt Hash</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/90 disabled:opacity-50 transition-all"
                >
                  {isLoggingIn ? 'Verifying Credentials...' : 'Authenticate & Enter'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* 2. AUTHENTICATED CONSOLE */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-56 bg-white/[0.02] border-r border-white/10 p-3 sm:p-4 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'overview', label: 'Overview', icon: Layers },
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'services', label: 'Services & Rates', icon: DollarSign },
                { id: 'portfolio', label: 'Portfolio Works', icon: Edit3 },
                { id: 'leads', label: 'Leads & Inquiries', icon: Users },
                { id: 'settings', label: 'Website Settings', icon: Settings },
                { id: 'security', label: 'Access & Security', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap text-left ${
                      isActive
                        ? 'bg-white text-[#130e09] font-bold shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="mt-auto hidden md:block pt-6 border-t border-white/10">
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/40 hover:text-white transition-colors"
                >
                  <RefreshCw size={11} />
                  <span>Refresh DB State</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#130e09]">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold uppercase text-white tracking-wide">
                      Executive Overview
                    </h3>
                    <p className="text-xs text-white/50 font-light">
                      Real-time database counts for inquiries, appointments, and live content.
                    </p>
                  </div>

                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block">
                        New Inquiries
                      </span>
                      <span className="text-3xl font-bold font-mono text-white mt-1 block">
                        {stats?.totalInquiries || inquiries.length}
                      </span>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-amber-500/20">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 block">
                        Pending Appointments
                      </span>
                      <span className="text-3xl font-bold font-mono text-white mt-1 block">
                        {stats?.newBookings || bookings.filter(b => b.status === 'pending').length}
                      </span>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-emerald-500/20">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 block">
                        Confirmed Bookings
                      </span>
                      <span className="text-3xl font-bold font-mono text-white mt-1 block">
                        {stats?.confirmedBookings || bookings.filter(b => b.status === 'confirmed').length}
                      </span>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block">
                        Active Services
                      </span>
                      <span className="text-3xl font-bold font-mono text-white mt-1 block">
                        {stats?.activeServices || services.length}
                      </span>
                    </div>
                  </div>

                  {/* Recent Bookings Queue */}
                  <div className="p-5 bg-white/[0.02] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Recent Appointment Requests
                      </h4>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-xs text-white/60 hover:text-white uppercase font-mono tracking-wider"
                      >
                        View All Bookings &rarr;
                      </button>
                    </div>

                    <div className="space-y-2">
                      {bookings.slice(0, 4).map((b) => (
                        <div
                          key={b.id}
                          className="p-3 bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono text-white/40 mr-2">{b.id}</span>
                            <strong className="text-white">{b.clientName}</strong>
                            <span className="text-white/50 ml-2">({b.serviceName})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-white/60">
                              {b.preferredDate} @ {b.timeSlot}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: BOOKINGS MANAGEMENT */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold uppercase text-white tracking-wide">
                        Bookings & Appointments
                      </h3>
                      <p className="text-xs text-white/50 font-light">
                        Review customer appointments, confirm time slots, reschedule, and export CSV.
                      </p>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 border border-white/20 text-xs font-mono uppercase text-white hover:bg-white hover:text-[#130e09] transition-colors flex items-center gap-2"
                    >
                      <FileSpreadsheet size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  {/* Filters & Search */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/10 text-xs">
                      {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setBookingFilter(st)}
                          className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
                            bookingFilter === st
                              ? 'bg-white text-[#130e09] font-bold'
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={14} className="absolute left-3 top-2.5 text-white/30" />
                      <input
                        type="text"
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        placeholder="Search by client name, email, ref..."
                        className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div className="space-y-3">
                    {filteredBookings.length === 0 ? (
                      <div className="p-8 text-center text-xs text-white/40 font-mono border border-white/10">
                        No bookings matching current filter.
                      </div>
                    ) : (
                      filteredBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 bg-white/[0.02] border border-white/10 hover:border-white/25 transition-all text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-white tracking-wider">
                                {b.id}
                              </span>
                              <span className="text-white/50">/</span>
                              <strong className="text-white text-sm">{b.clientName}</strong>
                              {b.businessName && (
                                <span className="text-white/40 text-[11px]">({b.businessName})</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                                  b.status === 'confirmed'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : b.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-white/10 text-white/60'
                                }`}
                              >
                                {b.status}
                              </span>

                              {b.webhookStatus && (
                                <span
                                  className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                                    b.webhookStatus === 'sent'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : b.webhookStatus === 'simulated'
                                      ? 'bg-sky-500/20 text-sky-300'
                                      : b.webhookStatus === 'failed'
                                      ? 'bg-red-500/20 text-red-300'
                                      : 'bg-white/10 text-white/50'
                                  }`}
                                  title={`Automated alert status: ${b.webhookStatus}`}
                                >
                                  Alert: {b.webhookStatus}
                                </span>
                              )}

                              {/* Quick Action buttons */}
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateBooking(b.id, { status: 'confirmed' })}
                                  className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-mono font-bold uppercase tracking-wider"
                                >
                                  Confirm
                                </button>
                              )}

                              {b.status !== 'completed' && (
                                <button
                                  onClick={() => handleUpdateBooking(b.id, { status: 'completed' })}
                                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono uppercase tracking-wider"
                                >
                                  Mark Done
                                </button>
                              )}

                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateBooking(b.id, { status: 'cancelled' })}
                                  className="px-2 py-1 text-red-400 hover:text-red-300 text-[10px] font-mono uppercase tracking-wider"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Details Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-white/70">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-white/40 block">Contact:</span>
                              <a href={`mailto:${b.email}`} className="text-white hover:underline block truncate">
                                {b.email}
                              </a>
                              <a href={`tel:${b.phone}`} className="text-white/80 hover:underline block">
                                {b.phone}
                              </a>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono uppercase text-white/40 block">Service & Slot:</span>
                              <div className="text-white font-medium">{b.serviceName}</div>
                              <div className="font-mono text-white/80">
                                {b.preferredDate} at {b.timeSlot} ({b.clientTimeZone})
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono uppercase text-white/40 block">Requirements:</span>
                              <p className="line-clamp-2 text-white/60 font-light">
                                {b.requirements}
                              </p>
                            </div>
                          </div>

                          {/* Private Notes Input */}
                          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-white/40 shrink-0">Admin Note:</span>
                            <input
                              type="text"
                              defaultValue={b.adminNotes || ''}
                              onBlur={(e) => {
                                if (e.target.value !== (b.adminNotes || '')) {
                                  handleUpdateBooking(b.id, { adminNotes: e.target.value });
                                }
                              }}
                              placeholder="Add private note (auto-saves on blur)..."
                              className="flex-1 bg-white/[0.03] border border-white/10 px-2 py-1 text-[11px] text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SERVICES & PRICING */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold uppercase text-white tracking-wide">
                        Services & Pricing Models
                      </h3>
                      <p className="text-xs text-white/50 font-light">
                        Configure pricing, packages (Starter, Professional, Premium), deliverables, and public visibility.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setEditingService({
                          id: `svc-${Date.now()}`,
                          name: 'New Custom Capability',
                          slug: 'new-capability',
                          shortDescription: 'Comprehensive scope description...',
                          category: 'Development',
                          startingPrice: null,
                          priceType: 'quote',
                          currency: 'GBP',
                          billingType: 'one-time',
                          deliverables: ['Custom milestone 1', 'Custom milestone 2'],
                          packages: [],
                          active: true,
                          publicVisible: true,
                          order: services.length + 1,
                        })
                      }
                      className="px-4 py-2 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                    >
                      <Plus size={14} />
                      <span>Add Service</span>
                    </button>
                  </div>

                  {/* Editing Modal / Drawer for Service */}
                  {editingService && (
                    <div className="p-6 bg-white/[0.04] border border-white/20 mb-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-sm font-bold uppercase text-white">
                          Edit Capability: {editingService.name}
                        </h4>
                        <button
                          onClick={() => setEditingService(null)}
                          className="text-white/50 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Service Title</label>
                          <input
                            type="text"
                            value={editingService.name}
                            onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Category</label>
                          <input
                            type="text"
                            value={editingService.category}
                            onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-white/40 uppercase font-mono mb-1">Short Description</label>
                          <textarea
                            rows={2}
                            value={editingService.shortDescription}
                            onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Starting Price (Leave empty for Custom Quote)</label>
                          <input
                            type="number"
                            value={editingService.startingPrice === null ? '' : editingService.startingPrice}
                            onChange={(e) =>
                              setEditingService({
                                ...editingService,
                                startingPrice: e.target.value === '' ? null : parseFloat(e.target.value),
                              })
                            }
                            placeholder="e.g. 750 (empty = Quote)"
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Currency</label>
                          <select
                            value={editingService.currency}
                            onChange={(e) => setEditingService({ ...editingService, currency: e.target.value })}
                            className="w-full p-2 bg-[#130e09] border border-white/15 text-white"
                          >
                            <option value="GBP">GBP (£)</option>
                            <option value="PKR">PKR (Rs)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                        <button
                          onClick={() => setEditingService(null)}
                          className="px-4 py-2 border border-white/20 text-xs text-white uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveService(editingService)}
                          className="px-6 py-2 bg-white text-[#130e09] text-xs font-bold uppercase tracking-wider"
                        >
                          Save Service
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Services List */}
                  <div className="space-y-4">
                    {services.map((svc) => (
                      <div
                        key={svc.id}
                        className="p-5 bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-white/40 uppercase">{svc.category}</span>
                            <span className="text-white/20">/</span>
                            <strong className="text-white text-sm uppercase">{svc.name}</strong>
                          </div>
                          <p className="text-white/60 font-light max-w-xl line-clamp-2">
                            {svc.shortDescription}
                          </p>
                          <div className="mt-2 text-white/40 font-mono">
                            Price: {svc.startingPrice ? `${svc.currency} ${svc.startingPrice}` : 'Custom Quote'} &bull; Packages: {svc.packages?.length || 0}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setEditingService(svc)}
                            className="px-3 py-1.5 border border-white/20 text-white hover:bg-white hover:text-[#130e09] uppercase font-mono tracking-wider transition-colors"
                          >
                            Edit Pricing
                          </button>
                          <button
                            onClick={() => handleDeleteService(svc.id)}
                            className="p-2 text-red-400 hover:text-red-300"
                            title="Delete Service"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 4: PORTFOLIO MANAGEMENT */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold uppercase text-white tracking-wide">
                        Portfolio Management
                      </h3>
                      <p className="text-xs text-white/50 font-light">
                        Add, edit, publish/unpublish, and configure Before & After comparison showcases.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setEditingProject({
                          id: `proj-${Date.now()}`,
                          title: 'New Client Commission',
                          clientName: 'Client Enterprise',
                          serviceCategory: 'Website Design & Development',
                          description: 'Comprehensive transformation overview...',
                          thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                          completionDate: new Date().toISOString().split('T')[0],
                          status: 'Published',
                          tags: ['Web', 'Digital'],
                          results: ['100% responsive architecture'],
                        })
                      }
                      className="px-4 py-2 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                    >
                      <Plus size={14} />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {/* Project Edit Modal */}
                  {editingProject && (
                    <div className="p-6 bg-white/[0.04] border border-white/20 mb-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-sm font-bold uppercase text-white">
                          Edit Portfolio: {editingProject.title}
                        </h4>
                        <button
                          onClick={() => setEditingProject(null)}
                          className="text-white/50 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Project Title</label>
                          <input
                            type="text"
                            value={editingProject.title}
                            onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Client Name</label>
                          <input
                            type="text"
                            value={editingProject.clientName}
                            onChange={(e) => setEditingProject({ ...editingProject, clientName: e.target.value })}
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Category</label>
                          <input
                            type="text"
                            value={editingProject.serviceCategory}
                            onChange={(e) => setEditingProject({ ...editingProject, serviceCategory: e.target.value })}
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Status</label>
                          <select
                            value={editingProject.status}
                            onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                            className="w-full p-2 bg-[#130e09] border border-white/15 text-white"
                          >
                            <option value="Published">Published (Public)</option>
                            <option value="Draft">Draft (Hidden)</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-white/40 uppercase font-mono mb-1">Thumbnail URL</label>
                          <input
                            type="url"
                            value={editingProject.thumbnail}
                            onChange={(e) => setEditingProject({ ...editingProject, thumbnail: e.target.value })}
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Before Image URL (Optional)</label>
                          <input
                            type="url"
                            value={editingProject.beforeImage || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, beforeImage: e.target.value })}
                            placeholder="https://..."
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">After Image URL (Optional)</label>
                          <input
                            type="url"
                            value={editingProject.afterImage || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, afterImage: e.target.value })}
                            placeholder="https://..."
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-white/40 uppercase font-mono mb-1">Description</label>
                          <textarea
                            rows={3}
                            value={editingProject.description}
                            onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                            className="w-full p-2 bg-white/[0.04] border border-white/15 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                        <button
                          onClick={() => setEditingProject(null)}
                          className="px-4 py-2 border border-white/20 text-xs text-white uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveProject(editingProject)}
                          className="px-6 py-2 bg-white text-[#130e09] text-xs font-bold uppercase tracking-wider"
                        >
                          Save Project
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Projects List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolio.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-white/[0.02] border border-white/10 flex flex-col justify-between text-xs"
                      >
                        <div className="flex gap-4 mb-3">
                          <img
                            src={p.thumbnail}
                            alt={p.title}
                            className="w-20 h-20 object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold ${
                                p.status === 'Published'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-white/10 text-white/50'
                              }`}
                            >
                              {p.status}
                            </span>
                            <h4 className="font-bold text-white uppercase mt-1">{p.title}</h4>
                            <span className="text-white/40 block">Client: {p.clientName}</span>
                            <span className="text-white/30 text-[10px] font-mono">{p.serviceCategory}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <button
                            onClick={() => setEditingProject(p)}
                            className="text-white hover:underline uppercase font-mono tracking-wider"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="text-red-400 hover:text-red-300 uppercase font-mono"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 5: LEADS & INQUIRIES */}
              {activeTab === 'leads' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold uppercase text-white tracking-wide">
                      Leads & Direct Inquiries
                    </h3>
                    <p className="text-xs text-white/50 font-light">
                      Track submissions from contact forms and chatbot escalations.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {inquiries.length === 0 ? (
                      <div className="p-8 text-center text-xs text-white/40 font-mono border border-white/10">
                        No inquiries received yet.
                      </div>
                    ) : (
                      inquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="p-4 bg-white/[0.02] border border-white/10 text-xs space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                            <div className="flex items-center gap-3">
                              <strong className="text-white text-sm">{inq.clientName}</strong>
                              <span className="text-white/40">/</span>
                              <span className="text-white/70">{inq.email}</span>
                              {inq.phone && <span className="text-white/50">({inq.phone})</span>}
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={inq.status}
                                onChange={(e) => handleUpdateInquiry(inq.id, { status: e.target.value as any })}
                                className="bg-[#130e09] border border-white/15 text-white text-[10px] uppercase font-mono px-2 py-1"
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="in_discussion">In Discussion</option>
                                <option value="converted">Converted</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </div>

                          <p className="text-white/80 font-light leading-relaxed">
                            {inq.message}
                          </p>

                          <div className="text-[10px] font-mono text-white/40 flex justify-between pt-1">
                            <span>Service: {inq.serviceCategory || 'General'}</span>
                            <span>{new Date(inq.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: WEBSITE SETTINGS */}
              {activeTab === 'settings' && settingsForm && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold uppercase text-white tracking-wide">
                      Studio Configuration & Socials
                    </h3>
                    <p className="text-xs text-white/50 font-light">
                      Update official WhatsApp, email, Instagram, TikTok, business hours, and public text.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-5">
                    
                    {/* Brand & Tagline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-white/40 uppercase font-mono mb-1">Brand Name</label>
                        <input
                          type="text"
                          value={settingsForm.brandName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                          className="w-full p-2.5 bg-white/[0.04] border border-white/15 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-white/40 uppercase font-mono mb-1">Tagline</label>
                        <input
                          type="text"
                          value={settingsForm.tagline}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                          className="w-full p-2.5 bg-white/[0.04] border border-white/15 text-white"
                        />
                      </div>
                    </div>

                    {/* Official Contact Channels */}
                    <div className="p-4 bg-white/[0.02] border border-white/10 space-y-4">
                      <span className="text-xs font-bold uppercase text-white tracking-wider block">
                        Official Contact & Messaging Channels
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Official Studio Email</label>
                          <input
                            type="email"
                            value={settingsForm.email}
                            onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                            className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">WhatsApp Local Number</label>
                          <input
                            type="text"
                            value={settingsForm.whatsappNumber}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                            className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">WhatsApp International Number</label>
                          <input
                            type="text"
                            value={settingsForm.whatsappIntl}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsappIntl: e.target.value })}
                            className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">WhatsApp wa.me Direct Link</label>
                          <input
                            type="text"
                            value={settingsForm.whatsappLink}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsappLink: e.target.value })}
                            className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Instagram Official Profile URL</label>
                          <input
                            type="text"
                            value={settingsForm.instagramUrl}
                            onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                            className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">TikTok Official Profile URL</label>
                          <input
                            type="text"
                            value={settingsForm.tiktokUrl}
                            onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                            className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Server-Side Webhook & Automated Email Alerts */}
                    <div className="p-4 bg-white/[0.02] border border-white/10 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold uppercase text-white tracking-wider block">
                            Automated Webhook & Email Alerts
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            Sends instantaneous notifications whenever a client reserves an appointment
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleTestWebhook}
                          disabled={testingWebhook}
                          className="px-3 py-1.5 border border-white/20 text-white hover:bg-white hover:text-[#130e09] text-[10px] font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          {testingWebhook ? 'Transmitting Test...' : 'Send Test Webhook'}
                        </button>
                      </div>

                      {webhookTestResult && (
                        <div className="p-2.5 bg-white/[0.04] border border-white/15 text-[11px] font-mono text-emerald-300">
                          {webhookTestResult}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">
                            Owner Alert Recipient Email
                          </label>
                          <input
                            type="email"
                            value={settingsForm.adminNotificationEmail || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, adminNotificationEmail: e.target.value })}
                            placeholder="mr.craft.studio21@gmail.com"
                            className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">
                            Webhook Target URL (Make, Zapier, Discord, Slack, Resend)
                          </label>
                          <input
                            type="url"
                            value={settingsForm.adminNotificationWebhookUrl || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, adminNotificationWebhookUrl: e.target.value })}
                            placeholder="https://hook.eu2.make.com/... or Zapier/Slack"
                            className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <input
                          type="checkbox"
                          id="enableWebhookNotifications"
                          checked={settingsForm.enableWebhookNotifications !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, enableWebhookNotifications: e.target.checked })}
                          className="rounded-none border-white/20"
                        />
                        <label htmlFor="enableWebhookNotifications" className="text-white/70 select-none">
                          Enable immediate automated webhook alert dispatch on booking submissions
                        </label>
                      </div>
                    </div>

                    {/* Business Hours & Booking Engine */}
                    <div className="p-4 bg-white/[0.02] border border-white/10 space-y-4">
                      <span className="text-xs font-bold uppercase text-white tracking-wider block">
                        Calendar & Scheduling Rules
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Hours Start</label>
                          <input
                            type="text"
                            value={settingsForm.businessHoursStart}
                            onChange={(e) => setSettingsForm({ ...settingsForm, businessHoursStart: e.target.value })}
                            className="w-full p-2 bg-[#130e09] border border-white/15 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Hours End</label>
                          <input
                            type="text"
                            value={settingsForm.businessHoursEnd}
                            onChange={(e) => setSettingsForm({ ...settingsForm, businessHoursEnd: e.target.value })}
                            className="w-full p-2 bg-[#130e09] border border-white/15 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-white/40 uppercase font-mono mb-1">Default Currency</label>
                          <select
                            value={settingsForm.defaultCurrency}
                            onChange={(e) => setSettingsForm({ ...settingsForm, defaultCurrency: e.target.value })}
                            className="w-full p-2 bg-[#130e09] border border-white/15 text-white font-mono"
                          >
                            <option value="GBP">GBP (£)</option>
                            <option value="PKR">PKR (Rs)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-white text-[#130e09] text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center gap-2"
                      >
                        <Save size={14} />
                        <span>Save All Settings</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* 7. ACCESS & SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="p-6 sm:p-8 space-y-8 max-w-4xl">
                  <div>
                    <h3 className="text-xl font-bold uppercase text-white tracking-wide mb-1">
                      Access Control & Security Architecture
                    </h3>
                    <p className="text-xs text-white/50 font-light">
                      Server-side authentication safeguards protecting confidential bookings, customer contact details, and studio operations.
                    </p>
                  </div>

                  {/* Security Architecture Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white/[0.02] border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                        <Shield size={14} className="text-emerald-400" />
                        <span>Session Token Cryptography</span>
                      </div>
                      <p className="text-xs text-white/60 font-light leading-relaxed">
                        Session tokens are cryptographically generated and verified server-side with HMAC SHA-256 using the server's <code className="text-white font-mono bg-white/10 px-1 py-0.5">ADMIN_SESSION_SECRET</code>. Secrets are never exposed to the client or public files.
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span>HMAC SHA-256 Verified Active</span>
                      </div>
                    </div>

                    <div className="p-5 bg-white/[0.02] border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                        <Key size={14} className="text-white" />
                        <span>Salted Password Hashing</span>
                      </div>
                      <p className="text-xs text-white/60 font-light leading-relaxed">
                        Admin credentials are stored strictly as cryptographically salted scrypt hashes in backend storage. Plaintext passwords and session secrets are never saved or used interchangeably.
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-white/40">
                        <span>Algorithm: Node.js Crypto Scrypt (N=16384, r=8, p=1)</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Active Session Meta */}
                  <div className="p-5 bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-white tracking-wider block mb-1">
                        Current Session Expiration
                      </span>
                      <span className="text-xs text-white/60 font-mono">
                        {sessionExpiresAt ? new Date(sessionExpiresAt).toLocaleString() : 'Active 24-hour cryptographic session'}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 border border-white/20 hover:border-white text-white text-xs uppercase font-mono tracking-wider transition-colors shrink-0 flex items-center gap-2"
                    >
                      <LogOut size={13} />
                      <span>Invalidate Session & Sign Out</span>
                    </button>
                  </div>

                  {/* Change Password Form */}
                  <div className="p-6 bg-white/[0.02] border border-white/10 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold uppercase text-white tracking-wider mb-1">
                        Update Administrator Password
                      </h4>
                      <p className="text-xs text-white/50 font-light">
                        Change the master login password. The backend will generate a new cryptographic salt and store only the resulting scrypt hash.
                      </p>
                    </div>

                    {passwordChangeStatus && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                        <CheckCircle size={14} />
                        <span>{passwordChangeStatus}</span>
                      </div>
                    )}

                    {passwordChangeError && (
                      <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-mono flex items-center gap-2">
                        <AlertTriangle size={14} />
                        <span>{passwordChangeError}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-mono text-white/40 mb-1.5">
                          Current Master Password
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password..."
                          className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white text-xs font-mono focus:border-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-mono text-white/40 mb-1.5">
                          New Administrator Password (min. 8 characters)
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new strong password..."
                          className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white text-xs font-mono focus:border-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-mono text-white/40 mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password..."
                          className="w-full p-2.5 bg-[#130e09] border border-white/15 text-white text-xs font-mono focus:border-white focus:outline-none"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="px-6 py-2.5 bg-white text-[#130e09] text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/90 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          <Key size={13} />
                          <span>{isChangingPassword ? 'Hashing & Updating...' : 'Update & Re-Hash Password'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
