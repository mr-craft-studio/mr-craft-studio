import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Esc', description: 'Close any active modal, drawer, or dialog' },
    { key: 'B', description: 'Open the Consultation Booking form from anywhere' },
    { key: 'M', description: 'Toggle the Studio Menu drawer' },
    { key: '?', description: 'Display this keyboard shortcuts overview' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#130e09] border border-white/20 p-6 sm:p-8 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Shortcuts"
          className="absolute top-5 right-5 p-1.5 text-white/50 hover:text-white border border-white/10 hover:border-white/30"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 mb-2">
          <Command size={12} className="text-white/60" />
          <span>Power Navigation</span>
        </div>

        <h3 className="text-xl font-bold uppercase text-white tracking-tight mb-4">
          Keyboard Shortcuts
        </h3>

        <p className="text-xs text-white/60 font-light mb-6">
          Global hotkeys configured for rapid studio navigation without mouse interaction:
        </p>

        {/* Shortcuts list */}
        <div className="space-y-3">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
            >
              <span className="text-white/70 font-light">{sc.description}</span>
              <kbd className="px-2 py-1 bg-white/10 border border-white/20 text-white font-mono font-bold text-[11px] uppercase tracking-wider shadow-sm shrink-0 ml-3">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
          <span>Shortcuts are inactive while typing in inputs</span>
          <button
            onClick={onClose}
            className="text-white hover:underline uppercase"
          >
            Dismiss (Esc)
          </button>
        </div>

      </div>
    </div>
  );
};
