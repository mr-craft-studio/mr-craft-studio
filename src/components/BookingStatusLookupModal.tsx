import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface BookingStatusLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingStatusLookupModal: React.FC<BookingStatusLookupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [refInput, setRefInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch(`/api/bookings/lookup?ref=${encodeURIComponent(refInput.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Booking reference not found');
      }
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking reference not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#130e09] border border-white/20 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/50 hover:text-white border border-white/10"
        >
          <X size={16} />
        </button>

        <div className="text-[10px] tracking-[0.25em] font-mono text-white/40 uppercase mb-2">
          Client Portal / Lookup
        </div>
        <h3 className="text-xl font-bold uppercase text-white tracking-tight mb-4">
          Check Booking Status
        </h3>

        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-1.5">
              Booking Reference Number (e.g. MRC-94021)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="MRC-XXXXX"
                className="w-full p-2.5 bg-white/[0.03] border border-white/15 text-white font-mono uppercase text-xs focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50"
              >
                <Search size={14} />
              </button>
            </div>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-white/50 uppercase font-mono">Status:</span>
              <span
                className={`font-mono uppercase font-bold px-2 py-0.5 text-[10px] ${
                  result.status === 'confirmed'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : result.status === 'pending'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-white/10 text-white'
                }`}
              >
                {result.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Client:</span>
              <span className="text-white font-medium">{result.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Service:</span>
              <span className="text-white">{result.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Appointment:</span>
              <span className="text-white">{result.preferredDate} at {result.timeSlot}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
