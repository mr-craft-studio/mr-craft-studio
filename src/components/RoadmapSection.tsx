import React, { useState } from 'react';
import { Milestone, CheckCircle2, Clock, Sparkles, ArrowRight, Compass } from 'lucide-react';
import type { RoadmapItem } from '../types';

interface RoadmapSectionProps {
  roadmap: RoadmapItem[];
  onOpenConsultation: () => void;
}

export const RoadmapSection: React.FC<RoadmapSectionProps> = ({
  roadmap,
  onOpenConsultation,
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');

  const quarters = ['all', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];

  const filteredRoadmap = selectedQuarter === 'all'
    ? roadmap
    : roadmap.filter(item => item.quarter.toLowerCase() === selectedQuarter.toLowerCase());

  const getStatusBadge = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono uppercase tracking-wider">
            <CheckCircle2 size={11} className="text-emerald-400" />
            <span>Delivered & Live</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-[#130e09] font-bold text-[10px] font-mono uppercase tracking-wider shadow-sm">
            <Sparkles size={11} className="animate-spin text-[#130e09]" />
            <span>In Active Deployment</span>
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/10 text-white/50 text-[10px] font-mono uppercase tracking-wider">
            <Clock size={11} />
            <span>Scheduled Milestone</span>
          </span>
        );
    }
  };

  return (
    <section id="roadmap" className="relative py-24 sm:py-32 bg-[#130e09] border-t border-white/[0.08]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase mb-3">
              <Compass size={12} className="text-white/50" />
              <span>Engineering Roadmap & Innovation Vectors</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white atelier-headline">
              STUDIO ROADMAP
            </h2>
          </div>

          <p className="max-w-md text-xs sm:text-sm text-white/60 font-light leading-relaxed">
            Our strategic trajectory across high-performance web architecture, autonomous AI agents, operational workflows, and spatial computing.
          </p>
        </div>

        {/* Quarter Filtering Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-14 border-b border-white/[0.06] no-scrollbar">
          {quarters.map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuarter(q)}
              className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-all whitespace-nowrap ${
                selectedQuarter === q
                  ? 'bg-white text-[#130e09] font-semibold shadow-md'
                  : 'text-white/50 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              {q === 'all' ? 'Entire Horizon' : q}
            </button>
          ))}
        </div>

        {/* Timeline Horizon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredRoadmap.map((item, idx) => (
            <div
              key={item.id}
              className={`atelier-glass p-6 sm:p-8 flex flex-col justify-between border transition-all duration-300 relative ${
                item.status === 'in_progress'
                  ? 'border-white/40 bg-white/[0.04]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Quarter & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span className="text-xs font-mono font-bold tracking-[0.2em] text-white/40 uppercase">
                    {item.quarter}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <div className="text-[10px] font-mono tracking-[0.25em] text-white/30 uppercase mb-2">
                  Vector / {item.category}
                </div>

                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white mb-3">
                  {item.title}
                </h3>

                <p className="text-xs text-white/60 font-light leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Key Milestones Checklist */}
                <div className="space-y-2 mb-8 border-t border-white/[0.08] pt-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-white/40 block mb-2">
                    Core Milestones
                  </span>
                  {item.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-[11px] text-white/70 font-light">
                      <span className="w-1 h-1 bg-white/40 rounded-full shrink-0 mt-1.5" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Target Date Meta */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>Target: {item.targetDate || '2026'}</span>
                <span className="uppercase tracking-widest">{item.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Suggest Milestone or Commission Specialized Tech CTA */}
        <div className="mt-16 p-8 sm:p-10 atelier-glass border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold uppercase text-white tracking-wide mb-2">
              Accelerate A Milestone For Your Organization?
            </h3>
            <p className="text-xs sm:text-sm text-white/60 font-light">
              We frequently sponsor and fast-track roadmap innovations (such as bespoke AI voice triage or WebGL spatial showcases) for dedicated client commissions.
            </p>
          </div>

          <button
            onClick={onOpenConsultation}
            className="px-8 py-3.5 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/90 transition-all shrink-0 active:scale-95 flex items-center gap-2"
          >
            <span>Commission Roadmap Scope</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
};
