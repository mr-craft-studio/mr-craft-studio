import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { ServiceModal } from './components/ServiceModal';
import { PortfolioSection } from './components/PortfolioSection';
import { ProjectModal } from './components/ProjectModal';
import { PricingSection } from './components/PricingSection';
import { BookingModal } from './components/BookingModal';
import { BookingStatusLookupModal } from './components/BookingStatusLookupModal';
import { ContactSection } from './components/ContactSection';
import { MenuDrawer } from './components/MenuDrawer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { AdminDashboard } from './components/AdminDashboard';
import { RoadmapSection } from './components/RoadmapSection';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ReadingProgressBar } from './components/ReadingProgressBar';
import { Logo } from './components/Logo';
import { MessageCircle, Mail, ArrowUp } from 'lucide-react';
import type { WebsiteSettings, ServiceItem, PortfolioProject, Booking, RoadmapItem } from './types';

const INITIAL_SETTINGS: WebsiteSettings = {
  brandName: 'MR. CRAFT STUDIO',
  tagline: 'Creative Design. Smart Technology. Digital Growth.',
  email: 'mr.craft.studio21@gmail.com',
  whatsappNumber: '03105603564',
  whatsappIntl: '+923105603564',
  whatsappLink: 'https://wa.me/923105603564',
  instagramUrl: 'https://instagram.com/mr.craft.studio?psln=aHZsbnppNGV0eTFh',
  tiktokUrl: 'https://www.tiktok.com/@mr.craft531',
  defaultCurrency: 'GBP',
  currencies: ['GBP', 'PKR', 'USD', 'EUR'],
  businessHoursStart: '09:00',
  businessHoursEnd: '18:00',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  appointmentDurationMin: 45,
  bufferMinutes: 15,
  blockedDates: [],
  heroHeadline: ['CRAFT', 'DIGITAL', 'GROWTH'],
};

export default function App() {
  const [settings, setSettings] = useState<WebsiteSettings>(INITIAL_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & UI states
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [lookupModalOpen, setLookupModalOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [bookingPresetService, setBookingPresetService] = useState<ServiceItem | null>(null);
  const [bookingPresetPackage, setBookingPresetPackage] = useState<string>('');
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState<boolean>(false);

  // Global Keyboard Event Listeners ('Esc' to close, 'B' for booking, 'M' for menu, '?' for shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // 1. ESCAPE: Close any currently open modal, drawer, or dialog
      if (e.key === 'Escape') {
        const hasOpenModal =
          menuOpen ||
          bookingModalOpen ||
          lookupModalOpen ||
          adminOpen ||
          Boolean(selectedService) ||
          Boolean(selectedProject) ||
          shortcutsHelpOpen;

        if (hasOpenModal) {
          e.preventDefault();
          if (isInputFocused && target) {
            target.blur();
          }
          setMenuOpen(false);
          setBookingModalOpen(false);
          setLookupModalOpen(false);
          setAdminOpen(false);
          setSelectedService(null);
          setSelectedProject(null);
          setShortcutsHelpOpen(false);
          return;
        }
      }

      // Do NOT trigger single-key hotkeys while user is typing in form inputs
      if (isInputFocused) return;

      // Ignore when system modifier keys (Ctrl / Cmd / Alt) are held
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // 2. 'B' / 'b': Open Booking Modal
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setBookingPresetService(null);
        setBookingPresetPackage('');
        setBookingModalOpen(true);
      }

      // 3. 'M' / 'm': Toggle Studio Menu Drawer
      else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMenuOpen((prev) => !prev);
      }

      // 4. '?': Toggle Keyboard Shortcuts Help
      else if (e.key === '?') {
        e.preventDefault();
        setShortcutsHelpOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    menuOpen,
    bookingModalOpen,
    lookupModalOpen,
    adminOpen,
    selectedService,
    selectedProject,
    shortcutsHelpOpen,
  ]);

  // Fetch initial public state
  const loadData = async () => {
    try {
      const [settingsRes, servicesRes, portfolioRes, roadmapRes] = await Promise.all([
        fetch('/api/settings').catch(() => null),
        fetch('/api/services').catch(() => null),
        fetch('/api/portfolio').catch(() => null),
        fetch('/api/roadmap').catch(() => null),
      ]);

      if (settingsRes && settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
      if (servicesRes && servicesRes.ok) {
        setServices(await servicesRes.json());
      }
      if (portfolioRes && portfolioRes.ok) {
        setPortfolio(await portfolioRes.json());
      }
      if (roadmapRes && roadmapRes.ok) {
        setRoadmap(await roadmapRes.json());
      }
    } catch (err) {
      console.error('Error loading studio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenBookingWithPreset = (service: ServiceItem, packageName?: string) => {
    setSelectedService(null);
    setBookingPresetService(service);
    setBookingPresetPackage(packageName || '');
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    console.log('Booking confirmed:', booking.id);
  };

  return (
    <div className="relative min-h-screen bg-[#130e09] text-white selection:bg-white/20 selection:text-white">
      {/* Page Reading Progress Bar fixed at very top */}
      <ReadingProgressBar />
      
      {/* Fixed Header */}
      <HeaderNav
        settings={settings}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenBooking={() => {
          setBookingPresetService(null);
          setBookingPresetPackage('');
          setBookingModalOpen(true);
        }}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenShortcuts={() => setShortcutsHelpOpen(true)}
      />

      <main>
        {/* Hero Section (Atelier Unit Composition) */}
        <HeroSection
          settings={settings}
          services={services}
          onOpenBooking={() => {
            setBookingPresetService(null);
            setBookingPresetPackage('');
            setBookingModalOpen(true);
          }}
          onExploreServices={() => handleScrollToSection('services')}
          onViewPortfolio={() => handleScrollToSection('portfolio')}
          onSelectService={(svc) => setSelectedService(svc)}
        />

        {/* Studio Services */}
        <ServicesSection
          services={services}
          onSelectService={(svc) => setSelectedService(svc)}
          onOpenBooking={() => {
            setBookingPresetService(null);
            setBookingPresetPackage('');
            setBookingModalOpen(true);
          }}
        />

        {/* Portfolio Showcase */}
        <PortfolioSection
          portfolio={portfolio}
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* Pricing System */}
        <PricingSection
          services={services}
          settings={settings}
          onOpenBookingForPackage={(svc, pkg) => handleOpenBookingWithPreset(svc, pkg)}
          onOpenConsultation={() => {
            setBookingPresetService(null);
            setBookingPresetPackage('');
            setBookingModalOpen(true);
          }}
        />

        {/* Studio Roadmap */}
        <RoadmapSection
          roadmap={roadmap}
          onOpenConsultation={() => {
            setBookingPresetService(null);
            setBookingPresetPackage('Roadmap Scope Commission');
            setBookingModalOpen(true);
          }}
        />

        {/* Contact & Lead Generation */}
        <ContactSection
          settings={settings}
          onOpenBooking={() => {
            setBookingPresetService(null);
            setBookingPresetPackage('');
            setBookingModalOpen(true);
          }}
          onOpenLookup={() => setLookupModalOpen(true)}
        />
      </main>

      {/* Minimal Atelier Unit Studio Footer */}
      <footer className="relative z-10 bg-[#0d0905] border-t border-white/[0.08] py-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1920px] mx-auto">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/[0.06]">
            <div>
              <Logo size={24} className="mb-2" />
              <p className="text-xs text-white/50 font-light max-w-sm">
                MR. CRAFT STUDIO &bull; Creative Design, Smart Technology, Digital Growth. Operating globally from Pakistan and the UK.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs uppercase font-mono tracking-wider text-white/60">
              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle size={14} className="text-emerald-400" />
                <span>WhatsApp: {settings.whatsappIntl}</span>
              </a>

              <a
                href={`mailto:${settings.email}`}
                className="hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Mail size={14} />
                <span>{settings.email}</span>
              </a>

              <button
                onClick={() => handleScrollToSection('roadmap')}
                className="hover:text-white transition-colors"
              >
                Roadmap
              </button>

              <button
                onClick={() => setLookupModalOpen(true)}
                className="hover:text-white transition-colors underline underline-offset-4"
              >
                Check Booking
              </button>

              <button
                onClick={() => setAdminOpen(true)}
                className="hover:text-white transition-colors"
              >
                Admin Console
              </button>

              <button
                onClick={() => setShortcutsHelpOpen(true)}
                className="hover:text-white transition-colors text-white/50"
                title="View Keyboard Shortcuts (?)"
              >
                Hotkeys [?]
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase font-mono tracking-[0.2em] text-white/40">
            <div>
              &copy; {new Date().getFullYear()} MR. CRAFT STUDIO. All Rights Reserved.
            </div>

            <div className="flex items-center gap-6">
              <span>Pure Typography / Cinematic Audio-Visual Architecture</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white flex items-center gap-1"
              >
                <span>Back To Top</span>
                <ArrowUp size={11} />
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget
        settings={settings}
        onOpenBooking={() => {
          setBookingPresetService(null);
          setBookingPresetPackage('');
          setBookingModalOpen(true);
        }}
        onScrollToSection={handleScrollToSection}
      />

      {/* Atelier Unit Menu Drawer */}
      <MenuDrawer
        isOpen={menuOpen}
        settings={settings}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleScrollToSection}
        onOpenBooking={() => {
          setBookingPresetService(null);
          setBookingPresetPackage('');
          setBookingModalOpen(true);
        }}
        onOpenLookup={() => setLookupModalOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Service Detail Modal */}
      <ServiceModal
        service={selectedService}
        settings={settings}
        onClose={() => setSelectedService(null)}
        onSelectPackageForBooking={handleOpenBookingWithPreset}
      />

      {/* Project Case Study Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onBookSimilar={() => {
          setBookingPresetService(null);
          setBookingPresetPackage('');
          setBookingModalOpen(true);
        }}
      />

      {/* Real Appointment Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        services={services}
        settings={settings}
        initialService={bookingPresetService}
        initialPackageName={bookingPresetPackage}
        onClose={() => setBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Client Booking Status Lookup Modal */}
      <BookingStatusLookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
      />

      {/* Private Owner Admin Dashboard */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onSettingsUpdated={(newSet) => setSettings(newSet)}
        onDataRefreshNeeded={loadData}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />

    </div>
  );
}
