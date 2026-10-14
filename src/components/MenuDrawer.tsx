import React from 'react';
import { X, ArrowRight, Shield, MessageCircle, Mail } from 'lucide-react';
import type { WebsiteSettings } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  settings: WebsiteSettings;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  settings,
  onClose,
  onNavigate,
  onOpenBooking,
  onOpenLookup,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  const navItems = [
    { label: '01 Overview', id: 'hero' },
    { label: '02 Capabilities & Services', id: 'services' },
    { label: '03 Portfolio Archive', id: 'portfolio' },
    { label: '04 Pricing Architecture', id: 'pricing' },
    { label: '05 Studio Roadmap', id: 'roadmap' },
    { label: '06 Contact & Briefings', id: 'contact' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md">
      {/* Sliding Menu Panel with Atelier Unit Palette (#fcfcfc background, #141414 text) */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#fcfcfc] text-[#141414] h-full flex flex-col justify-between p-8 sm:p-12 shadow-2xl transition-all duration-500 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-6">
          <div className="flex flex-col">
            <span className="font-mono text-xs tracking-[0.25em] uppercase font-bold text-black">
              MR. CRAFT STUDIO
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-black/50">
              Creative Digital Studio
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Studio Navigation"
            className="p-2 border border-black/15 hover:border-black transition-colors"
          >
            <X size={18} className="text-black" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <div className="my-auto py-8 space-y-5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className="group w-full flex items-center justify-between text-left py-2 border-b border-black/5 hover:border-black/20 transition-all"
            >
              <span className="text-lg sm:text-xl font-bold uppercase tracking-tight text-black group-hover:translate-x-2 transition-transform">
                {item.label}
              </span>
              <ArrowRight
                size={16}
                className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-black"
              />
            </button>
          ))}

          {/* Quick Consultation CTA */}
          <div className="pt-4 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onClose();
                onOpenBooking();
              }}
              className="w-full py-3 bg-[#141414] text-white hover:bg-black text-xs font-semibold uppercase tracking-[0.2em] transition-all text-center"
            >
              Book Project Consultation
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenLookup();
              }}
              className="w-full py-2.5 border border-black/20 text-[#141414] hover:bg-black/5 text-xs uppercase tracking-[0.2em] transition-all text-center"
            >
              Lookup Existing Booking
            </button>
          </div>
        </div>

        {/* Bottom Contact & Admin */}
        <div className="border-t border-black/10 pt-6 space-y-4 text-xs font-light text-black/70">
          <div className="flex items-center justify-between">
            <a
              href={`mailto:${settings.email}`}
              className="hover:text-black transition-colors flex items-center gap-1.5"
            >
              <Mail size={13} />
              <span>{settings.email}</span>
            </a>

            <a
              href={settings.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 font-medium"
            >
              <MessageCircle size={13} />
              <span>{settings.whatsappIntl}</span>
            </a>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-black/5">
            <div className="flex gap-4">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black uppercase tracking-wider font-mono"
              >
                Instagram
              </a>
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black uppercase tracking-wider font-mono"
              >
                TikTok
              </a>
            </div>

            {/* Owner Admin link */}
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="flex items-center gap-1 hover:text-black text-[10px] uppercase font-mono tracking-wider font-semibold"
            >
              <Shield size={12} />
              <span>Admin Console</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
