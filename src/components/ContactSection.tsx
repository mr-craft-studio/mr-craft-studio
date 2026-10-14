import React, { useState } from 'react';
import { Mail, MessageCircle, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';
import type { WebsiteSettings } from '../types';

interface ContactSectionProps {
  settings: WebsiteSettings;
  onOpenBooking: () => void;
  onOpenLookup: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  settings,
  onOpenBooking,
  onOpenLookup,
}) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [serviceCategory, setServiceCategory] = useState<string>('Website Design & Development');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete name, email, and message fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          serviceCategory,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-[#0d0905] border-t border-white/[0.08]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase mb-3">
              Direct Communication Channel
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white atelier-headline">
              INITIATE A DIALOGUE
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-6 py-2.5 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/90 transition-all"
            >
              Book Consultation
            </button>
            <button
              onClick={onOpenLookup}
              className="px-4 py-2.5 border border-white/20 text-white text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
            >
              Lookup Booking
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Direct Details on Left, Inquiry Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column (5 cols): Official Studio Channels */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <p className="text-sm text-white/70 font-light leading-relaxed mb-8">
                Whether you are launching an ambitious digital flagship, exploring bespoke AI automation, or elevating your brand identity, MR. CRAFT STUDIO provides direct founder-level access.
              </p>
            </div>

            {/* Official Contact Cards */}
            <div className="space-y-4">
              
              {/* WhatsApp Official Support */}
              <a
                href={`${settings.whatsappLink}?text=${encodeURIComponent(
                  'Hello MR. CRAFT STUDIO, I would like to discuss a new digital project.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="atelier-glass p-5 flex items-center justify-between border border-white/10 hover:border-emerald-500/40 group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block">
                      WhatsApp Support (Official)
                    </span>
                    <span className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                      {settings.whatsappIntl} ({settings.whatsappNumber})
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-white/40 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              {/* Official Email */}
              <a
                href={`mailto:${settings.email}`}
                className="atelier-glass p-5 flex items-center justify-between border border-white/10 hover:border-white/30 group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/[0.05] text-white border border-white/15">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block">
                      Official Email
                    </span>
                    <span className="text-sm font-medium text-white group-hover:text-white transition-colors">
                      {settings.email}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

            </div>

            {/* Social Media Links */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 block mb-4">
                Official Studio Channels
              </span>

              <div className="flex flex-wrap gap-4">
                {/* Instagram */}
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-white/[0.03] border border-white/10 text-xs text-white/80 hover:text-white hover:border-white/30 tracking-[0.16em] uppercase flex items-center gap-2 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>@mr.craft.studio</span>
                </a>

                {/* TikTok */}
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-white/[0.03] border border-white/10 text-xs text-white/80 hover:text-white hover:border-white/30 tracking-[0.16em] uppercase flex items-center gap-2 transition-all"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.28 6.28 0 0 0 1.86-4.49V8.65a8.28 8.28 0 0 0 5.23 1.83V7.03a4.84 4.84 0 0 1-1.32-.34z"/>
                  </svg>
                  <span>@mr.craft531</span>
                </a>
              </div>
            </div>

            {/* Studio Hours */}
            <div className="p-4 bg-white/[0.02] border border-white/10 text-xs font-mono text-white/50 space-y-1">
              <div>Business Hours: {settings.businessHoursStart} — {settings.businessHoursEnd} PKT</div>
              <div>Operating Days: {settings.workingDays?.join(', ')}</div>
            </div>

          </div>

          {/* Right Column (7 cols): Service Inquiry Form */}
          <div className="lg:col-span-7 atelier-glass p-8 sm:p-10 border border-white/15">
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 block mb-1">
                Written Briefing
              </span>
              <h3 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-wide">
                Send Project Brief
              </h3>
            </div>

            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold uppercase text-white mb-2">Message Dispatched</h4>
                <p className="text-xs text-white/60 font-light max-w-sm mx-auto mb-6">
                  Your project brief has been recorded in the studio database. The principal engineer will respond within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 border border-white/20 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-[#130e09] transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Liam Sterling"
                      className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="liam@domain.com"
                      className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1">
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 310..."
                      className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1">
                      Area of Focus
                    </label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs focus:border-white focus:outline-none"
                    >
                      <option value="Website Design & Development" className="bg-[#130e09]">
                        Website Design & Development
                      </option>
                      <option value="Graphic Design" className="bg-[#130e09]">
                        Graphic Design & Identity
                      </option>
                      <option value="Social Media Management" className="bg-[#130e09]">
                        Social Media Management
                      </option>
                      <option value="AI Solutions" className="bg-[#130e09]">
                        AI Chatbots & Agents
                      </option>
                      <option value="Business Automation" className="bg-[#130e09]">
                        Business Automation
                      </option>
                      <option value="SEO & CTR Optimization" className="bg-[#130e09]">
                        SEO & CTR Optimization
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1">
                    Project Brief & Scope *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your current business challenge or product roadmap..."
                    className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Transmitting...' : 'Transmit Project Brief'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
