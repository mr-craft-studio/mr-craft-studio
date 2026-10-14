import React, { useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import type { WebsiteSettings, ServiceItem } from '../types';

interface HeroSectionProps {
  settings: WebsiteSettings;
  services: ServiceItem[];
  onOpenBooking: () => void;
  onExploreServices: () => void;
  onViewPortfolio: () => void;
  onSelectService: (service: ServiceItem) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  services,
  onOpenBooking,
  onExploreServices,
  onViewPortfolio,
  onSelectService,
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Group services for the 3-column hero layout
  const primaryServices = services.slice(0, 3);

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#130e09] pt-24 sm:pt-28 pb-10 sm:pb-14 select-none">
      
      {/* 1. CINEMATIC BACKGROUND VIDEO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-40' : 'opacity-20'
          }`}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261005_143740_52dbf3ef-ea20-4594-a1ad-91d6c2970159.mp4"
            type="video/mp4"
          />
        </video>

        {/* Vertical atmospheric dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0905]/80 via-[#130e09]/50 to-[#130e09]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#130e09]/60 to-[#0d0905]" />
      </div>

      {/* 2. ATMOSPHERIC 48-COLUMN GRID OVERLAY */}
      <div className="atelier-grid-48" aria-hidden="true">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="atelier-grid-col" />
        ))}
      </div>

      {/* 3. HERO TOP METADATA BAR & FINE HORIZONTAL RULE */}
      <div className="relative z-10 max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] tracking-[0.25em] text-white/50 uppercase pb-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>Studio Open / Available For Worldwide Q4 Commissions</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span>Identity / Architecture / Intelligence</span>
            <span className="text-white/30">EST. 2024</span>
          </div>
        </div>
        <div className="atelier-fine-rule" />
      </div>

      {/* 4. OVERSIZED CINEMATIC HEADLINE */}
      {/* "CRAFT DIGITAL GROWTH" Letter Clipping & Entrance */}
      <div className="relative z-10 max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-10 my-auto py-8 sm:py-12 flex flex-col justify-center items-center text-center">
        
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          
          {/* Subtle Studio Subhead */}
          <div className="mb-4 sm:mb-6 overflow-hidden">
            <p className="text-[11px] sm:text-[13px] tracking-[0.45em] text-white/60 uppercase font-light">
              Architecting Digital Dominance
            </p>
          </div>

          {/* Line 1: CRAFT */}
          <div className="overflow-hidden w-full">
            <h1 className="atelier-headline text-[15vw] sm:text-[13vw] md:text-[11vw] lg:text-[9.5vw] text-white tracking-[-0.04em] leading-[0.88] transition-transform duration-700 hover:scale-[1.01]">
              CRAFT
            </h1>
          </div>

          {/* Line 2: DIGITAL */}
          <div className="overflow-hidden w-full">
            <h1 className="atelier-headline text-[15vw] sm:text-[13vw] md:text-[11vw] lg:text-[9.5vw] text-white/90 tracking-[-0.04em] leading-[0.88] transition-transform duration-700 hover:scale-[1.01]">
              DIGITAL
            </h1>
          </div>

          {/* Line 3: GROWTH */}
          <div className="overflow-hidden w-full">
            <h1 className="atelier-headline text-[15vw] sm:text-[13vw] md:text-[11vw] lg:text-[9.5vw] text-white tracking-[-0.04em] leading-[0.88] transition-transform duration-700 hover:scale-[1.01]">
              GROWTH
            </h1>
          </div>

          {/* Restrained CTAs under headline */}
          <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 z-20">
            <button
              onClick={onOpenBooking}
              className="px-7 sm:px-9 py-3 sm:py-3.5 bg-white text-[#130e09] text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.22em] hover:bg-white/90 transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-2"
            >
              <span>Start A Project</span>
              <ArrowUpRight size={14} />
            </button>

            <a
              href={settings.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 sm:px-8 py-3 sm:py-3.5 bg-white/5 border border-white/20 text-white text-[11px] sm:text-[12px] font-medium uppercase tracking-[0.2em] hover:bg-white/10 hover:border-emerald-400/40 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>WhatsApp Direct</span>
            </a>

            <button
              onClick={onViewPortfolio}
              className="px-6 sm:px-8 py-3 sm:py-3.5 text-white/70 hover:text-white text-[11px] sm:text-[12px] font-medium uppercase tracking-[0.2em] transition-colors"
            >
              Explore Our Work
            </button>
          </div>

        </div>

      </div>

      {/* 5. HERO 3-COLUMN SERVICE LABELS & FINE DIVIDER */}
      <div className="relative z-10 max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-10">
        <div className="atelier-fine-rule mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {primaryServices.map((svc, idx) => (
            <div
              key={svc.id}
              onClick={() => onSelectService(svc)}
              className="group cursor-pointer p-4 -m-4 rounded transition-all hover:bg-white/[0.03]"
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] tracking-[0.3em] font-mono text-white/40 group-hover:text-white/80 transition-colors">
                  0{idx + 1}
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </div>

              <h2 className="text-[14px] sm:text-[15px] font-medium tracking-[0.08em] text-white uppercase mb-1.5 group-hover:text-white transition-colors">
                {svc.name}
              </h2>

              <p className="text-[12px] text-white/50 font-light line-clamp-2 leading-relaxed">
                {svc.shortDescription}
              </p>
            </div>
          ))}
        </div>

        {/* Explore all link */}
        <div className="mt-6 flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-white/40">
          <span>6 Capabilities Available</span>
          <button
            onClick={onExploreServices}
            className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white"
          >
            Explore All 6 Studio Services &rarr;
          </button>
        </div>

      </div>

    </section>
  );
};
