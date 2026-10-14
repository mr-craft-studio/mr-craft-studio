import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, MessageCircle } from 'lucide-react';
import type { ServiceItem, WebsiteSettings, Booking } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  services: ServiceItem[];
  settings: WebsiteSettings;
  initialService?: ServiceItem | null;
  initialPackageName?: string;
  onClose: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  services,
  settings,
  initialService,
  initialPackageName,
  onClose,
  onBookingSuccess,
}) => {
  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedPackageName, setSelectedPackageName] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  
  // Date & Slot state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  
  const [preferredDate, setPreferredDate] = useState<string>(minDateStr);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotReason, setSlotReason] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Initialize service & package when modal opens or props change
  useEffect(() => {
    if (initialService) {
      setSelectedServiceId(initialService.id);
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }

    if (initialPackageName) {
      setSelectedPackageName(initialPackageName);
    }
  }, [initialService, initialPackageName, services]);

  // Fetch available slots from server when date changes
  useEffect(() => {
    if (!preferredDate) return;

    let isMounted = true;
    setLoadingSlots(true);
    setSlotReason('');
    setTimeSlot('');

    fetch(`/api/availability?date=${preferredDate}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        setLoadingSlots(false);
        if (data.availableSlots && Array.isArray(data.availableSlots)) {
          setAvailableSlots(data.availableSlots);
          if (data.availableSlots.length > 0) {
            setTimeSlot(data.availableSlots[0]);
          }
        } else {
          setAvailableSlots([]);
          setSlotReason(data.reason || 'No consultation slots available on this date.');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setLoadingSlots(false);
        setAvailableSlots(['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']);
        setTimeSlot('10:00 AM');
      });

    return () => {
      isMounted = false;
    };
  }, [preferredDate]);

  if (!isOpen) return null;

  const currentService = services.find(s => s.id === selectedServiceId) || services[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validation
    if (!clientName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please provide a valid business email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMsg('Please enter a valid phone or WhatsApp number.');
      return;
    }
    if (!preferredDate || !timeSlot) {
      setErrorMsg('Please choose an available appointment date and time slot.');
      return;
    }
    if (!requirements.trim() || requirements.trim().length < 5) {
      setErrorMsg('Please provide a brief description of your project or requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: currentService?.id || 'general',
          serviceName: currentService?.name || 'General Project Consultation',
          packageName: selectedPackageName || 'Custom Consultation',
          clientName: clientName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          businessName: businessName.trim(),
          websiteUrl: websiteUrl.trim(),
          requirements: requirements.trim(),
          preferredDate,
          timeSlot,
          clientTimeZone: userTimeZone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm booking. Please try again.');
      }

      setConfirmedBooking(data.booking);
      if (onBookingSuccess) {
        onBookingSuccess(data.booking);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setClientName('');
    setEmail('');
    setPhone('');
    setRequirements('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#130e09] border border-white/20 p-6 sm:p-10 my-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={handleReset}
          aria-label="Close Booking Dialog"
          className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/30"
        >
          <X size={18} />
        </button>

        {/* Confirmed Success State */}
        {confirmedBooking ? (
          <div className="text-center py-6">
            {/* Animated Checkmark using framer-motion */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              {/* Radial pulse glow */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.7, 1.25, 1.05], opacity: [0, 0.55, 0.2] }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-emerald-500/30 blur-md pointer-events-none"
              />

              {/* Vector Checkmark with stroked path drawing */}
              <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none">
                {/* Background soft circle */}
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="rgba(16, 185, 129, 0.12)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />

                {/* Outer ring drawing path */}
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0, rotate: -90 }}
                  animate={{ pathLength: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />

                {/* Animated checkmark check path */}
                <motion.path
                  d="M25 41.5 L35 51.5 L55 29.5"
                  fill="transparent"
                  stroke="#34d399"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                />
              </svg>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.4, ease: 'easeOut' }}
            >
              <div className="text-[10px] uppercase tracking-[0.3em] font-mono text-emerald-400 mb-2">
                Appointment Reserved & Saved
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold uppercase text-white tracking-tight mb-3">
                CONSULTATION CONFIRMED
              </h3>

              <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto mb-6 font-light">
                Thank you, <strong className="text-white">{confirmedBooking.clientName}</strong>. Your consultation has been locked in the studio calendar.
              </p>
            </motion.div>

            {/* Reference Badge */}
            <div className="p-4 bg-white/[0.03] border border-white/10 max-w-sm mx-auto mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40 uppercase font-mono">Reference ID:</span>
                <span className="font-mono font-bold text-white tracking-widest">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40 uppercase font-mono">Service:</span>
                <span className="text-white">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40 uppercase font-mono">Date & Slot:</span>
                <span className="text-white">{confirmedBooking.preferredDate} at {confirmedBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-white/10">
                <span className="text-white/40 uppercase font-mono">Owner Alert:</span>
                <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Instant Webhook Dispatched
                </span>
              </div>
            </div>

            {/* Action buttons: WhatsApp confirmation + Close */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`${settings.whatsappLink}?text=${encodeURIComponent(
                  `Hello MR. CRAFT STUDIO, I have just booked consultation ${confirmedBooking.id} for ${confirmedBooking.serviceName} on ${confirmedBooking.preferredDate} at ${confirmedBooking.timeSlot}. My name is ${confirmedBooking.clientName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <MessageCircle size={15} />
                <span>Notify On WhatsApp</span>
              </a>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 border border-white/20 text-white hover:bg-white hover:text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div>
            <div className="mb-6">
              <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase mb-2">
                Studio Commission / Appointment
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                BOOK A CONSULTATION
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-white/60 font-light">
                Schedule a private project scoping session with MR. CRAFT STUDIO. Real-time availability verified directly with the studio backend.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Service Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
                    Service Required *
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      setSelectedPackageName('');
                    }}
                    className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs focus:border-white focus:outline-none transition-colors"
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id} className="bg-[#130e09] text-white">
                        {svc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Package Selection (if service has packages) */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
                    Engagement Package (Optional)
                  </label>
                  <select
                    value={selectedPackageName}
                    onChange={(e) => setSelectedPackageName(e.target.value)}
                    className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs focus:border-white focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-[#130e09] text-white">
                      Custom Discussion / Quote
                    </option>
                    {currentService?.packages?.map((pkg) => (
                      <option key={pkg.id} value={pkg.name} className="bg-[#130e09] text-white">
                        {pkg.name} ({pkg.price !== null ? `${pkg.currency} ${pkg.price}` : 'Custom Quote'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Alexander Vance"
                    className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@company.com"
                    className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp & Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
                    WhatsApp or Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567 or +44 77..."
                    className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
                    Business Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Vance Architectural Ltd"
                    className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
                  Current Website or Social Link (Optional)
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                />
              </div>

              {/* Date & Real Time Slot Picker */}
              <div className="p-4 bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white tracking-wide">
                    <Calendar size={14} className="text-white/50" />
                    <span>Select Appointment Date</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">
                    Mon–Sat, 09:00–18:00
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={minDateStr}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full p-2 bg-[#130e09] border border-white/15 text-white text-xs focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1">
                      Available Time Slot *
                    </label>
                    {loadingSlots ? (
                      <div className="p-2 text-xs text-white/50 font-mono animate-pulse">
                        Checking studio availability...
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full p-2 bg-[#130e09] border border-white/15 text-white text-xs focus:border-white focus:outline-none"
                      >
                        {availableSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 text-xs text-amber-300 font-mono">
                        {slotReason || 'No slots available. Choose another date.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
                  Project Goals & Scope Overview *
                </label>
                <textarea
                  required
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Share your goals, target audience, preferred timeline, or existing pain points..."
                  className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white text-xs placeholder:text-white/20 focus:border-white focus:outline-none transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || availableSlots.length === 0}
                  className="w-full py-3.5 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.22em] hover:bg-white/90 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 flex items-center justify-center gap-2 shadow-xl"
                >
                  {isSubmitting ? (
                    <span>Confirming Appointment With Server...</span>
                  ) : (
                    <>
                      <span>Lock Appointment & Reserve Slot</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
