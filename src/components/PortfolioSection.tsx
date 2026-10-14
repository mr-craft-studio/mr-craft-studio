import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowUpRight, Layers, Search, Filter, RefreshCcw } from 'lucide-react';
import type { PortfolioProject } from '../types';

interface PortfolioSectionProps {
  portfolio: PortfolioProject[];
  onSelectProject: (project: PortfolioProject) => void;
}

interface FilterCategory {
  key: string;
  label: string;
  shortLabel?: string;
}

const FILTER_CATEGORIES: FilterCategory[] = [
  { key: 'all', label: 'All Works' },
  { key: 'web', label: 'Web', shortLabel: 'Web Apps & Flagships' },
  { key: 'branding', label: 'Branding', shortLabel: 'Brand & Visual Identity' },
  { key: 'ai', label: 'AI', shortLabel: 'AI Chatbots & Agents' },
  { key: 'automation', label: 'Automation', shortLabel: 'Operations & Workflows' },
];

interface AnimatedProjectCardProps {
  project: PortfolioProject;
  index: number;
  onSelect: (project: PortfolioProject) => void;
}

const AnimatedProjectCard: React.FC<AnimatedProjectCardProps> = ({
  project,
  index,
  onSelect,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's reduced motion preferences
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const currentEl = cardRef.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(currentEl);

    return () => {
      observer.disconnect();
    };
  }, [project.id]);

  // Stagger delay between columns (left vs right column)
  const staggerDelay = `${(index % 2) * 120}ms`;

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(project)}
      style={{
        transitionDelay: isVisible ? staggerDelay : '0ms',
      }}
      className={`group cursor-pointer flex flex-col justify-between transition-all duration-700 ease-out will-change-transform ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8 sm:translate-y-10'
      }`}
    >
      {/* Media Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#130e09] border border-white/10 group-hover:border-white/30 transition-all duration-500 mb-6">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Overlaid Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-[9px] font-mono uppercase tracking-[0.2em] text-white/80 border border-white/10">
            {project.serviceCategory}
          </span>
          {project.beforeImage && (
            <span className="px-2.5 py-1 bg-white text-[#130e09] text-[9px] font-mono font-bold uppercase tracking-[0.2em]">
              Before / After
            </span>
          )}
        </div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-3 bg-white text-[#130e09] rounded-none shadow-xl flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
            <span>View Case Study</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>

      {/* Text Meta */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mb-2">
          <span>Client / {project.clientName}</span>
          <span>{project.completionDate}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-2 group-hover:text-white transition-colors">
          {project.title}
        </h3>

        <p className="text-xs sm:text-sm text-white/60 font-light line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Tags preview */}
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.slice(0, 4).map((tag, tIdx) => (
            <span
              key={tIdx}
              className="text-[10px] font-mono text-white/40 tracking-[0.15em] uppercase"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  portfolio,
  onSelectProject,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category matching helper
  const matchesCategory = (project: PortfolioProject, categoryKey: string): boolean => {
    if (categoryKey === 'all') return true;
    const cat = (project.serviceCategory || '').toLowerCase();
    const tags = (project.tags || []).map(t => t.toLowerCase());

    if (categoryKey === 'web') {
      return (
        cat.includes('web') ||
        cat.includes('site') ||
        cat.includes('development') ||
        tags.some(t => t.includes('web') || t.includes('react') || t.includes('tailwind') || t.includes('ui') || t.includes('architecture'))
      );
    }
    if (categoryKey === 'branding') {
      return (
        cat.includes('graphic') ||
        cat.includes('brand') ||
        cat.includes('identity') ||
        cat.includes('design') ||
        tags.some(t => t.includes('brand') || t.includes('logo') || t.includes('editorial') || t.includes('identity') || t.includes('design'))
      );
    }
    if (categoryKey === 'ai') {
      return (
        cat.includes('ai') ||
        cat.includes('intelligence') ||
        cat.includes('agent') ||
        cat.includes('bot') ||
        tags.some(t => t.includes('ai') || t.includes('gemini') || t.includes('bot') || t.includes('triage') || t.includes('live'))
      );
    }
    if (categoryKey === 'automation') {
      return (
        cat.includes('automation') ||
        cat.includes('workflow') ||
        tags.some(t => t.includes('automation') || t.includes('crm') || t.includes('workflow') || t.includes('api') || t.includes('sync'))
      );
    }
    return cat.includes(categoryKey.toLowerCase());
  };

  // Compute live project counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FILTER_CATEGORIES.forEach(cat => {
      counts[cat.key] = portfolio.filter(p => matchesCategory(p, cat.key)).length;
    });
    return counts;
  }, [portfolio]);

  // Filtered & searched projects
  const filteredProjects = useMemo(() => {
    return portfolio.filter(project => {
      const matchCat = matchesCategory(project, activeCategory);
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = project.title.toLowerCase().includes(q);
      const matchClient = project.clientName.toLowerCase().includes(q);
      const matchDesc = project.description.toLowerCase().includes(q);
      const matchTags = (project.tags || []).some(t => t.toLowerCase().includes(q));
      const matchCategoryName = project.serviceCategory.toLowerCase().includes(q);

      return matchTitle || matchClient || matchDesc || matchTags || matchCategoryName;
    });
  }, [portfolio, activeCategory, searchQuery]);

  return (
    <section id="portfolio" className="relative py-24 sm:py-32 bg-[#0d0905] border-t border-white/[0.08]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase mb-3">
              <Layers size={12} className="text-white/50" />
              <span>Selected Works & Case Studies</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white atelier-headline">
              PORTFOLIO ARCHIVE
            </h2>
          </div>

          <p className="max-w-md text-xs sm:text-sm text-white/60 font-light leading-relaxed">
            Real systems deployed for real businesses. Minimalist aesthetics merged with uncompromising commercial performance.
          </p>
        </div>

        {/* Category-based Filtering Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-12 border-b border-white/[0.08]">
          
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {FILTER_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.key] || 0;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`group relative flex items-center gap-2 px-3.5 sm:px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#130e09] font-bold shadow-lg'
                      : 'text-white/60 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20'
                  }`}
                  aria-pressed={isActive}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-none transition-colors ${
                      isActive
                        ? 'bg-[#130e09] text-white font-semibold'
                        : 'bg-white/10 text-white/60 group-hover:text-white'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Optional Quick Keyword Search */}
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-2.5 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, tech..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/[0.02] border border-white/10 text-xs text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[10px] text-white/40 hover:text-white font-mono"
              >
                CLEAR
              </button>
            )}
          </div>

        </div>

        {/* Results Counter / Category Status Indicator */}
        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/40 uppercase mb-8">
          <div>
            <span>Filtering By: </span>
            <strong className="text-white">
              {FILTER_CATEGORIES.find(c => c.key === activeCategory)?.label || 'All Works'}
            </strong>
            {searchQuery && <span> &bull; Query: "{searchQuery}"</span>}
          </div>
          <div>
            <span>{filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'} Found</span>
          </div>
        </div>

        {/* Empty State when no projects match current filter */}
        {filteredProjects.length === 0 ? (
          <div className="p-16 text-center atelier-glass border border-white/10 my-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <Filter size={18} />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-white mb-2">
              No Projects in this Discipline
            </h3>
            <p className="text-xs text-white/50 font-light max-w-md mx-auto mb-6">
              No portfolio projects currently match the selected filter. We engineer custom scopes across Web, Branding, AI, and Automation.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 bg-white text-[#130e09] text-xs font-semibold uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-white/90 transition-all"
              >
                <RefreshCcw size={12} />
                <span>Show All Works</span>
              </button>
            </div>
          </div>
        ) : (
          /* Portfolio Editorial Grid with Intersection Observer Animation */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {filteredProjects.map((project, idx) => (
              <AnimatedProjectCard
                key={project.id}
                project={project}
                index={idx}
                onSelect={onSelectProject}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
