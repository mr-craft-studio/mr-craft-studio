import React from 'react';
import { X, Check, ArrowRight, MessageCircle } from 'lucide-react';
import type { ServiceItem, WebsiteSettings } from '../types';

interface ServiceModalProps {
  service: ServiceItem | null;
  settings: WebsiteSettings;
  onClose: () => void;
  onSelectPackageForBooking: (service: ServiceItem, packageName?: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  settings,
  onClose,
  onSelectPackageForBooking,
}) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#130e09] border border-white/15 p-6 sm:p-10 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Service Overview"
          className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/30"
        >
          <X size={18} />
        </button>

        {/* Category & Service Title */}
        <div className="mb-6">
          <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase mb-2">
            Service Capability / {service.category}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
            {service.name}
          </h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed font-light">
            {service.shortDescription}
          </p>
        </div>

        <div className="atelier-fine-rule my-6" />

        {/* Deliverables Checklist */}
        <div className="mb-8">
          <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase mb-4">
            Included Capabilities & Deliverables
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {service.deliverables.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Configured Packages (Starter, Professional, Premium) */}
        {service.packages && service.packages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase mb-4">
              Configured Engagement Packages
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 border transition-all flex flex-col justify-between ${
                    pkg.recommended
                      ? 'border-white/40 bg-white/[0.04]'
                      : 'border-white/10 bg-white/[0.01]'
                  }`}
                >
                  <div>
                    {pkg.recommended && (
                      <span className="inline-block text-[9px] uppercase tracking-[0.25em] text-emerald-400 mb-2">
                        Featured Tier
                      </span>
                    )}
                    <h4 className="text-sm font-semibold uppercase text-white tracking-wide">
                      {pkg.name}
                    </h4>
                    <div className="mt-2 text-xs font-mono text-white/60">
                      {pkg.price !== null
                        ? `${pkg.currency} ${pkg.price.toLocaleString()}${pkg.billingType === 'monthly' ? '/mo' : ''}`
                        : 'Custom Quote'}
                    </div>

                    <div className="mt-3 space-y-1.5 text-[11px] text-white/60 font-light border-t border-white/10 pt-3">
                      <div>Timeline: {pkg.deliveryTime}</div>
                      <div>Revisions: {pkg.revisions}</div>
                    </div>

                    <ul className="mt-3 space-y-1 text-[11px] text-white/70">
                      {pkg.deliverables.slice(0, 4).map((d, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-white/40 rounded-full" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => onSelectPackageForBooking(service, pkg.name)}
                    className="mt-5 w-full py-2 border border-white/20 text-[10px] tracking-[0.2em] uppercase font-semibold text-white hover:bg-white hover:text-[#130e09] transition-colors"
                  >
                    Select Tier
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTAs */}
        <div className="atelier-fine-rule my-6" />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-white/40">
            All prices subject to studio scope agreement. No fabricated promises or lock-ins.
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`${settings.whatsappLink}?text=${encodeURIComponent(
                `Hello MR. CRAFT STUDIO, I would like to inquire about your ${service.name} service.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-white/20 text-xs tracking-[0.18em] uppercase text-white hover:border-emerald-400 hover:text-emerald-400 flex items-center gap-2 transition-colors"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>Ask On WhatsApp</span>
            </a>

            <button
              onClick={() => onSelectPackageForBooking(service)}
              className="px-6 py-2.5 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-white/90 flex items-center gap-2 transition-colors"
            >
              <span>Book Consultation</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
