import React, { useState } from 'react';
import { ArrowUpRight, Plus, Sparkles, Code, Palette, Share2, Bot, Cpu, Search } from 'lucide-react';
import type { ServiceItem } from '../types';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
  onOpenBooking: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService,
  onOpenBooking,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const categories = ['all', 'Development', 'Design', 'Marketing', 'AI & Tech', 'Automation', 'Optimization'];

  const filteredServices = activeTab === 'all'
    ? services
    : services.filter(s => s.category.toLowerCase() === activeTab.toLowerCase());

  const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('website') || n.includes('web')) return <Code size={18} className="text-white/60" />;
    if (n.includes('graphic') || n.includes('brand')) return <Palette size={18} className="text-white/60" />;
    if (n.includes('social')) return <Share2 size={18} className="text-white/60" />;
    if (n.includes('ai solutions') || n.includes('chat')) return <Bot size={18} className="text-white/60" />;
    if (n.includes('automation') || n.includes('workflow')) return <Cpu size={18} className="text-white/60" />;
    return <Search size={18} className="text-white/60" />;
  };

  return (
    <section id="services" className="relative py-24 sm:py-32 bg-[#130e09] border-t border-white/[0.08]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase mb-3">
              <Sparkles size={12} className="text-white/50" />
              <span>Capabilities Matrix</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white atelier-headline">
              STUDIO SERVICES
            </h2>
          </div>

          <p className="max-w-md text-xs sm:text-sm text-white/60 font-light leading-relaxed">
            Engineered for founders and companies who value restrained elegance, technological superiority, and measurable commercial growth.
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-white/[0.06] no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-all whitespace-nowrap ${
                activeTab === cat
                  ? 'bg-white text-[#130e09] font-semibold'
                  : 'text-white/50 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid (6 services) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service, idx) => (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="atelier-glass-card group p-6 sm:p-8 flex flex-col justify-between cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-300 relative overflow-hidden"
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/40">0{idx + 1}</span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 border border-white/10 px-2 py-0.5">
                      {service.category}
                    </span>
                  </div>
                  <div className="p-2 rounded-full border border-white/10 group-hover:border-white/40 transition-colors">
                    {getServiceIcon(service.name)}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-3 group-hover:text-white transition-colors">
                  {service.name}
                </h3>

                <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed mb-6 line-clamp-3">
                  {service.shortDescription}
                </p>

                {/* Deliverables Preview */}
                <div className="space-y-1.5 mb-8">
                  {service.deliverables.slice(0, 3).map((item, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-[11px] text-white/50 font-light">
                      <span className="w-1 h-1 bg-white/30 rounded-full shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Price & Action */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">
                    Pricing
                  </span>
                  <span className="text-xs font-mono text-white/80">
                    {service.startingPrice !== null
                      ? `From ${service.currency} ${service.startingPrice.toLocaleString()}`
                      : 'Custom Quote'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-white group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Custom Request Banner */}
        <div className="mt-16 p-8 sm:p-12 atelier-glass border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold uppercase text-white tracking-wide mb-2">
              Require A Bespoke Studio Scope?
            </h3>
            <p className="text-xs sm:text-sm text-white/60 font-light">
              We engineer custom workflows combining web architecture, AI voice bots, and automated customer funnels for specialized business models.
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="px-8 py-3.5 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/90 transition-all shrink-0 active:scale-95"
          >
            Request Custom Consultation
          </button>
        </div>

      </div>
    </section>
  );
};
