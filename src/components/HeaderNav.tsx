import React from 'react';
import { Logo } from './Logo';
import { Mail, MessageCircle, Shield } from 'lucide-react';
import type { WebsiteSettings } from '../types';

interface HeaderNavProps {
  settings: WebsiteSettings;
  onOpenMenu: () => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenShortcuts?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  settings,
  onOpenMenu,
  onOpenBooking,
  onOpenAdmin,
  onOpenShortcuts,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#130e09]/80 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Identity & Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 group">
            <Logo size={24} />
          </a>

          {/* Minimalist Divider */}
          <div className="hidden xl:block h-6 w-px bg-white/10" />

          {/* Tagline */}
          <div className="hidden xl:flex items-center">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-light">
              {settings.tagline || 'Creative Design. Smart Technology. Digital Growth.'}
            </span>
          </div>
        </div>

        {/* Center/Right: Contact Info & Action Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Quick Direct Contact Links */}
          <div className="hidden md:flex items-center gap-5 text-[11px] tracking-[0.16em] uppercase text-white/70">
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
              title="Official Studio Email"
            >
              <Mail size={13} className="text-white/40" />
              <span className="hidden lg:inline">{settings.email}</span>
              <span className="lg:hidden">Email</span>
            </a>

            <div className="h-3 w-px bg-white/10" />

            <a
              href={settings.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
              title="Direct WhatsApp"
            >
              <MessageCircle size={13} className="text-emerald-400/80" />
              <span className="hidden lg:inline">{settings.whatsappIntl}</span>
              <span className="lg:hidden">WhatsApp</span>
            </a>
          </div>

          {/* Book Consultation CTA Button with Keyboard Shortcut Badge [B] */}
          <button
            onClick={onOpenBooking}
            title="Press 'B' to open booking"
            className="group hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium tracking-[0.2em] uppercase border border-white/20 text-white hover:bg-white hover:text-[#130e09] transition-all duration-300"
          >
            <span>Book Consultation</span>
            <kbd className="hidden lg:inline text-[9px] font-mono text-white/50 group-hover:text-[#130e09]/70 border border-white/20 group-hover:border-black/20 px-1 py-0.2">
              B
            </kbd>
          </button>

          {/* Visual Language Indicator (EN) */}
          <div className="flex items-center px-2 py-1 text-[10px] tracking-[0.25em] text-white/50 uppercase border border-white/10 select-none">
            EN
          </div>

          {/* Keyboard Shortcuts Trigger [?] */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts ('?')"
              className="hidden md:flex items-center justify-center w-6 h-6 text-[10px] font-mono text-white/40 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
            >
              ?
            </button>
          )}

          {/* Admin Fast Toggle Button */}
          <button
            onClick={onOpenAdmin}
            title="Owner Admin Dashboard"
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            <Shield size={15} />
          </button>

          {/* Minimal Atelier Unit White Menu Control with Keyboard Shortcut Badge [M] */}
          <button
            onClick={onOpenMenu}
            title="Press 'M' to toggle menu"
            aria-label="Open Studio Menu"
            className="group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#fcfcfc] text-[#141414] hover:bg-white text-[11px] font-semibold tracking-[0.22em] uppercase transition-all duration-300 shadow-sm active:scale-95"
          >
            <span className="w-1.5 h-1.5 bg-[#141414] rounded-full group-hover:scale-125 transition-transform" />
            <span>Menu</span>
            <kbd className="hidden sm:inline text-[8px] font-mono text-black/40 border border-black/15 px-1 py-0.2">
              M
            </kbd>
          </button>

        </div>
      </div>
    </header>
  );
};
