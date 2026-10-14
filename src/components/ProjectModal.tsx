import React from 'react';
import { X, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import type { PortfolioProject } from '../types';

interface ProjectModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
  onBookSimilar: (category: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onBookSimilar,
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#130e09] border border-white/15 p-6 sm:p-10 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Project Modal"
          className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/30"
        >
          <X size={18} />
        </button>

        {/* Header Metadata */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.25em] font-mono text-white/40 uppercase mb-3">
            <span>{project.serviceCategory}</span>
            <span>/</span>
            <span>Client: {project.clientName}</span>
            <span>/</span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {project.completionDate}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-4">
            {project.title}
          </h2>

          <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Before & After Interactive Slider (if present) */}
        {project.beforeImage && project.afterImage ? (
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.25em] font-mono text-white/50 uppercase mb-2">
              Interactive Transformation (Drag Slider)
            </div>
            <BeforeAfterSlider
              beforeImage={project.beforeImage}
              afterImage={project.afterImage}
              beforeLabel="Legacy Brand / System"
              afterLabel="MR. CRAFT Production Suite"
            />
          </div>
        ) : (
          /* Single Hero Thumbnail */
          <div className="mb-8 overflow-hidden border border-white/10">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-80 sm:h-96 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Case Study Results & Impact */}
        {project.results && project.results.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase mb-4">
              Project Impact & Delivered Milestones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {project.results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white/[0.02] border border-white/10 flex items-start gap-2.5"
                >
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-white/80 font-light">{res}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {project.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-[0.18em] text-white/50 bg-white/[0.03] border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="atelier-fine-rule my-6" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          {project.websiteUrl ? (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white hover:text-emerald-400 transition-colors"
            >
              <span>Visit Live Experience</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <div className="text-xs text-white/40">Private Enterprise Deployment</div>
          )}

          <button
            onClick={() => {
              onClose();
              onBookSimilar(project.serviceCategory);
            }}
            className="px-6 py-2.5 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
          >
            Commission Similar Work
          </button>
        </div>

      </div>
    </div>
  );
};
