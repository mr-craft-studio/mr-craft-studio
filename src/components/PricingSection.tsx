import React, { useState } from 'react';
import { Check, HelpCircle, ArrowRight, BarChart2 } from 'lucide-react';
import { ComplexityVsInvestmentChart } from './ComplexityVsInvestmentChart';
import type { ServiceItem, WebsiteSettings } from '../types';

interface PricingSectionProps {
  services: ServiceItem[];
  settings: WebsiteSettings;
  onOpenBookingForPackage: (service: ServiceItem, packageName: string) => void;
  onOpenConsultation: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  services,
  settings,
  onOpenBookingForPackage,
  onOpenConsultation,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(settings.defaultCurrency || 'GBP');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'svc-web-dev');

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  const currencySymbols: Record<string, string> = {
    GBP: '£',
    PKR: 'Rs ',
    USD: '$',
    EUR: '€',
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-[#130e09] border-t border-white/[0.08]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase mb-3">
              Transparent Investment Architecture
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white atelier-headline">
              STUDIO PRICING
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Quick Chart Anchor Button */}
            <button
              onClick={() => {
                const el = document.getElementById('pricing-value-chart');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 border border-white/20 hover:border-white text-white/80 hover:text-white text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <BarChart2 size={13} className="text-emerald-400" />
              <span>Complexity vs. Investment Chart</span>
            </button>

            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10">
              <span className="text-[10px] tracking-[0.2em] font-mono text-white/40 px-2 uppercase">
                Currency:
              </span>
              {(settings.currencies || ['GBP', 'PKR', 'USD']).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-all ${
                    selectedCurrency === curr
                      ? 'bg-white text-[#130e09] font-bold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Service Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 border-b border-white/[0.06] no-scrollbar">
          {services.map((svc) => (
            <button
              key={svc.id}
              onClick={() => setSelectedServiceId(svc.id)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.16em] transition-all whitespace-nowrap ${
                selectedService?.id === svc.id
                  ? 'bg-white text-[#130e09] font-semibold'
                  : 'text-white/50 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              {svc.name}
            </button>
          ))}
        </div>

        {/* Selected Service Package Cards */}
        {selectedService && selectedService.packages && selectedService.packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {selectedService.packages.map((pkg) => {
              const isCustomQuote = pkg.price === null;
              return (
                <div
                  key={pkg.id}
                  className={`atelier-glass p-8 flex flex-col justify-between border relative transition-all duration-300 ${
                    pkg.recommended
                      ? 'border-white/50 shadow-2xl bg-white/[0.05]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {pkg.recommended && (
                    <div className="absolute -top-3 right-8 px-3 py-0.5 bg-white text-[#130e09] text-[9px] uppercase tracking-[0.25em] font-bold">
                      Studio Recommended
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase mb-2">
                      {selectedService.name} / Tier
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-wide mb-3">
                      {pkg.name}
                    </h3>

                    <div className="mb-6">
                      {isCustomQuote ? (
                        <div>
                          <div className="text-2xl font-bold font-mono text-white">
                            Custom Quote
                          </div>
                          <span className="text-[11px] text-white/50 font-light">
                            Scope tailored to requirements
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-3xl font-bold font-mono text-white">
                            {currencySymbols[selectedCurrency] || selectedCurrency}
                            {pkg.price?.toLocaleString()}
                          </div>
                          <span className="text-[11px] text-white/50 font-light">
                            {pkg.billingType === 'monthly' ? 'Billed monthly retainer' : 'One-time project investment'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Timeline & Revisions Specs */}
                    <div className="py-3 border-y border-white/[0.08] mb-6 grid grid-cols-2 gap-2 text-[11px] text-white/60 font-light">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/40 block">Timeline</span>
                        <span>{pkg.deliveryTime}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/40 block">Revisions</span>
                        <span>{pkg.revisions}</span>
                      </div>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="space-y-2.5 mb-8">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 block mb-3">
                        Included Milestones
                      </span>
                      {pkg.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80 font-light">
                          <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking CTA */}
                  <button
                    onClick={() => onOpenBookingForPackage(selectedService, pkg.name)}
                    className={`w-full py-3 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      pkg.recommended
                        ? 'bg-white text-[#130e09] hover:bg-white/90 shadow-lg'
                        : 'border border-white/20 text-white hover:bg-white hover:text-[#130e09]'
                    }`}
                  >
                    <span>{isCustomQuote ? 'Request Scope Quote' : `Reserve ${pkg.name}`}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center atelier-glass border border-white/10">
            <h3 className="text-lg font-bold uppercase text-white mb-2">Custom Scope Engagement</h3>
            <p className="text-sm text-white/60 font-light mb-6">
              Pricing for this discipline is evaluated based on enterprise specifications.
            </p>
            <button
              onClick={onOpenConsultation}
              className="px-6 py-3 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em]"
            >
              Book Project Consultation
            </button>
          </div>
        )}

        {/* Value Visualizer: Recharts Complexity vs. Investment Chart */}
        <ComplexityVsInvestmentChart
          services={services}
          selectedServiceId={selectedService?.id || selectedServiceId}
          onSelectService={(serviceId) => setSelectedServiceId(serviceId)}
          onSelectPackage={(svc, pkgName) => onOpenBookingForPackage(svc, pkgName)}
          currency={currencySymbols[selectedCurrency] || selectedCurrency}
        />

        {/* Pricing Policies Callout */}
        <div className="mt-12 p-6 border border-white/[0.08] flex items-start gap-3 bg-white/[0.02] text-xs text-white/50 font-light">
          <HelpCircle size={16} className="text-white/40 shrink-0 mt-0.5" />
          <p>
            MR. CRAFT STUDIO operates with complete transparency. Rates are initialized as tailored scopes or configured directly by the studio director. All currency quotes in {selectedCurrency} reflect genuine engineering hours, intellectual property handover, and post-launch stability.
          </p>
        </div>

      </div>
    </section>
  );
};
