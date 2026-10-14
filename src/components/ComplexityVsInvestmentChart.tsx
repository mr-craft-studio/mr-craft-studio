import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Cpu, Layers, HelpCircle, CheckCircle } from 'lucide-react';
import type { ServiceItem, ServicePackage } from '../types';

interface ComplexityVsInvestmentChartProps {
  services: ServiceItem[];
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
  onSelectPackage?: (service: ServiceItem, packageName: string) => void;
  currency: string;
}

interface ChartPoint {
  id: string;
  name: string;
  shortName: string;
  category?: string;
  complexity: number;
  investment: number;
  roiScore?: number;
  timeline: string;
  keyDeliverable?: string;
  packagesCount?: number;
  priceLabel?: string;
  revisions?: string;
  recommended?: boolean;
  serviceRef?: ServiceItem;
  packageRef?: ServicePackage;
}

export const ComplexityVsInvestmentChart: React.FC<ComplexityVsInvestmentChartProps> = ({
  services,
  selectedServiceId,
  onSelectService,
  onSelectPackage,
  currency,
}) => {
  const [viewMode, setViewMode] = useState<'all-services' | 'current-service-tiers'>('all-services');

  // Derive standardized Complexity & Investment metrics for each service
  const serviceComparisonData: ChartPoint[] = services.map((svc) => {
    // Determine metrics based on known studio scopes and deliverables
    let complexity = 70;
    let investment = 65;
    let timeline = '1–2 Weeks';
    let roiScore = 8.5;
    let keyDeliverable = 'Custom engineering & delivery';

    const slug = (svc.slug || svc.id).toLowerCase();

    if (slug.includes('web') || slug.includes('dev')) {
      complexity = 88;
      investment = 82;
      timeline = '2–4 Weeks';
      roiScore = 9.4;
      keyDeliverable = 'Custom responsive web application & high-conversion flagship';
    } else if (slug.includes('ai') || slug.includes('assistant')) {
      complexity = 95;
      investment = 88;
      timeline = '1–3 Weeks';
      roiScore = 9.8;
      keyDeliverable = 'Autonomous AI agent pipelines, custom RAG & voice workflows';
    } else if (slug.includes('auto') || slug.includes('workflow')) {
      complexity = 78;
      investment = 70;
      timeline = '1–2 Weeks';
      roiScore = 9.2;
      keyDeliverable = 'End-to-end CRM triggers, lead pipelines & webhook automation';
    } else if (slug.includes('seo') || slug.includes('ctr')) {
      complexity = 80;
      investment = 74;
      timeline = 'Ongoing / 1 Week Sprint';
      roiScore = 9.1;
      keyDeliverable = 'Core Web Vitals acceleration, schema markup & CTR multiplication';
    } else if (slug.includes('graphic') || slug.includes('design') || slug.includes('brand')) {
      complexity = 68;
      investment = 62;
      timeline = '5–10 Days';
      roiScore = 8.8;
      keyDeliverable = 'Complete visual identity system, vector assets & brand guidelines';
    } else if (slug.includes('social') || slug.includes('media')) {
      complexity = 62;
      investment = 58;
      timeline = 'Monthly Retainer';
      roiScore = 8.4;
      keyDeliverable = 'High-frequency video reels, visual creatives & audience growth';
    } else {
      // Dynamic fallback based on deliverables count
      complexity = Math.min(92, Math.max(50, (svc.deliverables?.length || 4) * 14));
      investment = Math.min(90, Math.max(45, (svc.packages?.length || 2) * 25));
      timeline = '1–3 Weeks';
      roiScore = 8.6;
      keyDeliverable = svc.shortDescription || 'Bespoke atelier deliverable';
    }

    // Abbreviated label for clean X-axis rendering
    let shortName = svc.name;
    if (svc.name.includes('Website')) shortName = 'Web Dev';
    else if (svc.name.includes('Graphic')) shortName = 'Branding';
    else if (svc.name.includes('Social')) shortName = 'Social Growth';
    else if (svc.name.includes('AI Solutions')) shortName = 'AI & Agents';
    else if (svc.name.includes('Automation')) shortName = 'Automation';
    else if (svc.name.includes('SEO')) shortName = 'SEO & CTR';

    return {
      id: svc.id,
      name: svc.name,
      shortName,
      category: svc.category || 'Engineering',
      complexity,
      investment,
      roiScore,
      timeline,
      keyDeliverable,
      packagesCount: svc.packages?.length || 0,
      serviceRef: svc,
    };
  });

  // Current active service and its package tier breakdown
  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  const packageTierData: ChartPoint[] = (activeService?.packages || []).map((pkg, idx) => {
    // Calculate tier complexity and investment
    let complexity = 50 + idx * 22;
    let investment = 45 + idx * 24;

    const nameLower = pkg.name.toLowerCase();
    if (nameLower.includes('starter') || nameLower.includes('essential') || nameLower.includes('express')) {
      complexity = 48;
      investment = 42;
    } else if (nameLower.includes('professional') || nameLower.includes('flagship') || nameLower.includes('growth')) {
      complexity = 76;
      investment = 72;
    } else if (nameLower.includes('premium') || nameLower.includes('enterprise') || nameLower.includes('domination')) {
      complexity = 96;
      investment = 92;
    }

    const priceLabel = pkg.price !== null
      ? `${currency} ${pkg.price.toLocaleString()}`
      : 'Custom Scope';

    return {
      id: pkg.id,
      name: pkg.name,
      shortName: pkg.name.replace('Professional', 'Pro').replace('Enterprise', 'Ent.'),
      complexity,
      investment,
      timeline: pkg.deliveryTime || 'TBD',
      priceLabel,
      revisions: pkg.revisions || 'Standard',
      recommended: Boolean(pkg.recommended),
      packageRef: pkg,
    };
  });

  // Custom Atelier Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPackageView = viewMode === 'current-service-tiers';

      return (
        <div className="bg-[#1a140e] border border-white/20 p-4 shadow-2xl backdrop-blur-md max-w-xs text-xs font-sans">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-1 flex items-center justify-between">
            <span>{isPackageView ? `${activeService?.name} / Tier` : data.category}</span>
            {data.recommended && (
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/30">
                Recommended
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold uppercase tracking-tight text-white mb-2 pb-2 border-b border-white/10">
            {data.name}
          </h4>

          {/* Metric Comparison Badges */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 block font-mono">
                Complexity Index
              </span>
              <span className="text-base font-bold font-mono text-emerald-300">
                {data.complexity}/100
              </span>
            </div>

            <div className="p-2 bg-amber-500/10 border border-amber-500/20">
              <span className="text-[9px] uppercase tracking-wider text-amber-400 block font-mono">
                Investment Tier
              </span>
              <span className="text-base font-bold font-mono text-amber-300">
                {data.investment}/100
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] text-white/70 font-light mb-3">
            <div className="flex items-center justify-between">
              <span className="text-white/40 font-mono">Delivery Timeline:</span>
              <span className="text-white font-mono">{data.timeline}</span>
            </div>

            {!isPackageView && (
              <div className="flex items-center justify-between">
                <span className="text-white/40 font-mono">Value Multiplier:</span>
                <span className="text-emerald-400 font-mono font-bold">{data.roiScore}x ROI</span>
              </div>
            )}

            {isPackageView && (
              <div className="flex items-center justify-between">
                <span className="text-white/40 font-mono">Investment Spec:</span>
                <span className="text-amber-300 font-mono font-bold">{data.priceLabel}</span>
              </div>
            )}
          </div>

          <div className="text-[10px] text-white/40 italic border-t border-white/10 pt-2 flex items-center gap-1.5">
            <CheckCircle size={11} className="text-emerald-400 shrink-0" />
            <span>Click bar to inspect details and reserve scope</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (entry: any) => {
    if (!entry) return;
    if (viewMode === 'all-services') {
      onSelectService(entry.id);
    } else if (viewMode === 'current-service-tiers' && onSelectPackage && activeService) {
      onSelectPackage(activeService, entry.name);
    }
  };

  const currentDataset = viewMode === 'all-services' ? serviceComparisonData : packageTierData;

  return (
    <div id="pricing-value-chart" className="mt-16 bg-[#16100a] border border-white/15 p-6 sm:p-8 relative scroll-mt-24">
      {/* Visualizer Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 mb-2">
            <TrendingUp size={13} />
            <span>Value Architecture Visualizer &bull; Recharts Engine</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-2">
            Complexity vs. Investment Analysis
          </h3>

          <p className="text-xs sm:text-sm text-white/60 font-light max-w-2xl leading-relaxed">
            Quantifying technical engineering depth against client capital commitment. Notice how our high-leverage digital assets and autonomous workflows deliver non-linear value returns relative to implementation investment.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#130e09] border border-white/15 self-start lg:self-center">
          <button
            onClick={() => setViewMode('all-services')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewMode === 'all-services'
                ? 'bg-white text-[#130e09] font-bold shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>All Studio Services ({services.length})</span>
          </button>

          <button
            onClick={() => setViewMode('current-service-tiers')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewMode === 'current-service-tiers'
                ? 'bg-white text-[#130e09] font-bold shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Cpu size={13} />
            <span>{activeService?.name ? activeService.name.split(' ')[0] : 'Current'} Tiers</span>
          </button>
        </div>
      </div>

      {/* KPI Value Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white/[0.02] border border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
            Average Leverage Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">9.1 / 10</span>
            <span className="text-[10px] text-white/40 font-mono">Value/Capital</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
            Highest Complexity
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-white">AI Solutions & Agents</span>
            <span className="text-[10px] text-emerald-400 font-mono">95 pts</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
            Fastest Velocity
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-white">Brand Essentials</span>
            <span className="text-[10px] text-amber-300 font-mono">3–5 Days</span>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
            Recommended Tier
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-white">Professional Flagship</span>
            <span className="text-[10px] text-emerald-400 font-mono">Optimal ROI</span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-[360px] sm:h-[400px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentDataset}
            margin={{ top: 20, right: 30, left: -10, bottom: 35 }}
            barCategoryGap="20%"
            barGap={6}
          >
            {/* Subtle Atelier Dark Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.07)"
              vertical={false}
            />

            {/* X-Axis */}
            <XAxis
              dataKey="shortName"
              stroke="rgba(255, 255, 255, 0.4)"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />

            {/* Y-Axis */}
            <YAxis
              domain={[0, 100]}
              stroke="rgba(255, 255, 255, 0.4)"
              tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
              label={{
                value: 'Value Index (0–100)',
                angle: -90,
                position: 'insideLeft',
                fill: 'rgba(255, 255, 255, 0.35)',
                fontSize: 10,
                fontFamily: 'monospace',
                offset: 20,
              }}
            />

            {/* Interactive Tooltip */}
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '11px', fontFamily: 'monospace' }}
              formatter={(value) => (
                <span className="text-white/80 font-mono uppercase tracking-wider text-[11px] ml-1">
                  {value}
                </span>
              )}
            />

            {/* Complexity Bar (Emerald Theme) */}
            <Bar
              dataKey="complexity"
              name="Complexity (Technical Depth & Hours)"
              fill="#34d399"
              radius={[3, 3, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer transition-opacity duration-200"
            >
              {currentDataset.map((entry) => (
                <Cell
                  key={`cell-complexity-${entry.id}`}
                  fill={
                    viewMode === 'all-services' && entry.id === selectedServiceId
                      ? '#10b981' // highlighted active service
                      : '#34d399'
                  }
                  opacity={
                    viewMode === 'all-services' && entry.id === selectedServiceId
                      ? 1
                      : 0.85
                  }
                />
              ))}
            </Bar>

            {/* Investment Bar (Amber Theme) */}
            <Bar
              dataKey="investment"
              name="Investment (Capital & Scope Tier)"
              fill="#fbbf24"
              radius={[3, 3, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer transition-opacity duration-200"
            >
              {currentDataset.map((entry) => (
                <Cell
                  key={`cell-investment-${entry.id}`}
                  fill={
                    viewMode === 'all-services' && entry.id === selectedServiceId
                      ? '#f59e0b' // highlighted active service
                      : '#fbbf24'
                  }
                  opacity={
                    viewMode === 'all-services' && entry.id === selectedServiceId
                      ? 1
                      : 0.85
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Helper Footer */}
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-white/50">
        <div className="flex items-center gap-2">
          <HelpCircle size={13} className="text-white/40 shrink-0" />
          <span>
            {viewMode === 'all-services'
              ? `Currently highlighting: ${activeService?.name || 'Selected Service'}. Click any bar to switch service packages.`
              : `Inspecting tiers for: ${activeService?.name}. Click a bar to configure consultation.`}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider text-white/40 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#34d399] inline-block" />
            <span>Complexity (Hours, Architecture)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#fbbf24] inline-block" />
            <span>Investment (Scope, Deliverables)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
