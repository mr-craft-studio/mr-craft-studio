import express from 'express';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type { WebsiteSettings, ServiceItem, PortfolioProject, Booking, LeadInquiry, RoadmapItem } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory & persistent JSON database path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_PATH = path.resolve(DATA_DIR, 'database.json');

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AdminSession {
  sessionId: string;
  token: string;
  createdAt: string;
  expiresAt: number;
}

interface AdminAuthRecord {
  passwordSalt: string;
  passwordHash: string;
  lastUpdated: string;
}

interface DatabaseSchema {
  settings: WebsiteSettings;
  services: ServiceItem[];
  portfolio: PortfolioProject[];
  bookings: Booking[];
  inquiries: LeadInquiry[];
  roadmap: RoadmapItem[];
  adminTokens: string[];
  adminSessions?: AdminSession[];
  adminAuth?: AdminAuthRecord;
}

const DEFAULT_SETTINGS: WebsiteSettings = {
  brandName: "MR. CRAFT STUDIO",
  tagline: "Creative Design. Smart Technology. Digital Growth.",
  email: "mr.craft.studio21@gmail.com",
  adminNotificationEmail: "mr.craft.studio21@gmail.com",
  adminNotificationWebhookUrl: process.env.NOTIFICATION_WEBHOOK_URL || "",
  enableWebhookNotifications: true,
  whatsappNumber: "03105603564",
  whatsappIntl: "+923105603564",
  whatsappLink: "https://wa.me/923105603564",
  instagramUrl: "https://instagram.com/mr.craft.studio?psln=aHZsbnppNGetxTFh",
  tiktokUrl: "https://www.tiktok.com/@mr.craft531",
  defaultCurrency: "GBP",
  currencies: ["GBP", "PKR", "USD", "EUR"],
  businessHoursStart: "09:0s0",
  businessHoursEnd: "18:00",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  appointmentDurationMin: 45,
  bufferMinutes: 15,
  blockedDates: [],
  heroHeadline: ["CRAFT", "DIGITAL", "GROWTH"]
};

const DEFAULT_ROADMAP: RoadmapItem[] = [
  {
    id: "road-q1-arch",
    quarter: "Q1 2026",
    title: "Visual Architecture & Sub-Second Web Vitals",
    category: "Architecture",
    description: "Deployment of next-gen Tailwind CSS v4 styling, 48-column Atelier Unit grid architecture, and full mobile safe-area responsiveness with sub-second global load times.",
    status: "completed",
    deliverables: [
      "48-column atmospheric dark grid system",
      "Cinematic background video engine & typography clipping",
      "Lighthouse 95+ Core Web Vitals optimization",
      "Dynamic multi-currency pricing switch (GBP, PKR, USD, EUR)"
    ],
    targetDate: "March 2026"
  },
  {
    id: "road-q2-ai",
    quarter: "Q2 2026",
    title: "Autonomous AI Chatbots & Voice Calling Agents",
    category: "AI & Intelligence",
    description: "Direct enterprise fine-tuning on proprietary studio knowledge, multi-speaker conversational voice agents, and bidirectional WhatsApp customer escalation.",
    status: "in_progress",
    deliverables: [
      "Server-side Gemini 3.8 Flash support assistant with live studio grounding",
      "Inbound lead triage & automatic WhatsApp handoff",
      "Interactive Before & After slider for brand & code transformations",
      "Automated server-side webhook email alerting on booking submission"
    ],
    targetDate: "June 2026"
  },
  {
    id: "road-q3-crm",
    quarter: "Q3 2026",
    title: "Operations Suite & Automated Lead Engine",
    category: "Operations",
    description: "Full-cycle automated lead management, instant client calendar synchronization, customer WhatsApp follow-up drip sequences, and zero-touch invoicing.",
    status: "planned",
    deliverables: [
      "Real-time calendar slot collision prevention",
      "Bidirectional Google Calendar & WhatsApp appointment notifications",
      "Private owner analytics dashboard with CSV export engine",
      "Custom proposal generation & PDF quote exports"
    ],
    targetDate: "September 2026"
  },
  {
    id: "road-q4-spatial",
    quarter: "Q4 2026",
    title: "Spatial 3D Experiences & WebGL Creative Lab",
    category: "Spatial Design",
    description: "High-end WebGL spatial digital showrooms, dynamic custom 3D product visualizers, and interactive tactile shaders designed for ultra-luxury brands.",
    status: "planned",
    deliverables: [
      "Three.js / WebGL hardware-accelerated product showcases",
      "Interactive 3D model viewers with custom lighting presets",
      "Custom audio-reactive generative canvases",
      "Worldwide studio showcase exhibitions"
    ],
    targetDate: "December 2026"
  }
];

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "svc-web-dev",
    name: "Website Design & Development",
    slug: "website-design-development",
    shortDescription: "High-performance digital flagships, e-commerce stores, and high-conversion landing pages engineered with modern code and cinematic typography.",
    category: "Development",
    startingPrice: null, // "Custom Quote" default per prompt
    priceType: "quote",
    currency: "GBP",
    billingType: "one-time",
    deliverables: [
      "Custom responsive web application & landing page",
      "Cinematic aesthetic & tailored micro-interactions",
      "Full mobile & desktop responsive architecture",
      "SEO & technical performance optimization (95+ Lighthouse)",
      "Interactive booking & lead capture systems",
      "CMS integration or custom admin controls"
    ],
    packages: [
      {
        id: "pkg-web-starter",
        name: "Starter Launch",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "Bespoke single-page landing site",
          "Contact & WhatsApp integration",
          "Fast mobile optimization",
          "Domain & SSL configuration"
        ],
        deliveryTime: "5â€“7 Business Days",
        revisions: "2 Iteration Rounds"
      },
      {
        id: "pkg-web-pro",
        name: "Professional Flagship",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "Multi-page custom design & development (up to 6 pages)",
          "Interactive booking system & client forms",
          "Content management & project showcase",
          "Technical SEO & speed optimization"
        ],
        deliveryTime: "10â€“14 Business Days",
        revisions: "Unlimited during design phase",
        recommended: true
      },
      {
        id: "pkg-web-premium",
        name: "Premium Enterprise",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "End-to-end full stack web architecture",
          "Online ordering, booking, or e-commerce catalog",
          "Custom private admin dashboard",
          "AI chatbot & automation integration",
          "Dedicated 30-day post-launch support"
        ],
        deliveryTime: "3â€“4 Weeks",
        revisions: "Priority revisions"
      }
    ],
    active: true,
    publicVisible: true,
    order: 1
  },
  {
    id: "svc-graphic-design",
    name: "Graphic Design & Brand Identity",
    slug: "graphic-design",
    shortDescription: "Distinctive brand identities, minimal logos, art direction, and social creative systems that position businesses as market leaders.",
    category: "Design",
    startingPrice: null,
    priceType: "quote",
    currency: "GBP",
    billingType: "one-time",
    deliverables: [
      "Brand identity systems & vector logos",
      "Typography styling & color palette architecture",
      "Social media creative templates (Figma/Canva)",
      "High-impact marketing collaterals & pitch decks",
      "Full brand guidelines document (PDF)"
    ],
    packages: [
      {
        id: "pkg-gd-starter",
        name: "Brand Essentials",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "Primary logo mark & secondary variants",
          "Brand color palette & typography kit",
          "Vector & web-ready asset exports",
          "Social media profile kit"
        ],
        deliveryTime: "3â€“5 Business Days",
        revisions: "3 Rounds"
      },
      {
        id: "pkg-gd-pro",
        name: "Comprehensive Identity",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "Full visual identity & brand system",
          "Stationery, business cards & promotional design",
          "15 customized social media post templates",
          "Brand usage guidelines document"
        ],
        deliveryTime: "7â€“10 Business Days",
        revisions: "Unlimited during concept phase",
        recommended: true
      }
    ],
    active: true,
    publicVisible: true,
    order: 2
  },
  {
    id: "svc-social-media",
    name: "Social Media Management",
    slug: "social-media-management",
    shortDescription: "End-to-end social media growth: strategic content planning, creative production, video editing, and brand voice consistency.",
    category: "Marketing",
    startingPrice: null,
    priceType: "quote",
    currency: "GBP",
    billingType: "monthly",
    deliverables: [
      "Monthly content strategy & editorial calendar",
      "High-converting static & motion graphics",
      "Short-form video editing (Reels, TikToks, Shorts)",
      "Captions, hashtags & engagement optimization",
      "Monthly performance & analytics reports"
    ],
    packages: [
      {
        id: "pkg-smm-growth",
        name: "Monthly Growth",
        price: null,
        currency: "GBP",
        billingType: "monthly",
        deliverables: [
          "12 premium designed posts / month",
          "4 short-form video reels",
          "Copywriting & scheduled publishing",
          "Bi-weekly performance review"
        ],
        deliveryTime: "Ongoing Monthly",
        revisions: "Standard monthly review"
      },
      {
        id: "pkg-smm-domination",
        name: "Studio Domination",
        price: null,
        currency: "GBP",
        billingType: "monthly",
        deliverables: [
          "20 premium visual posts / month",
          "8 short-form reels / TikToks",
          "Community engagement & comment handling",
          "Paid ad campaign creative support"
        ],
        deliveryTime: "Ongoing Monthly",
        revisions: "Continuous collaboration",
        recommended: true
      }
    ],
    active: true,
    publicVisible: true,
    order: 3
  },
  {
    id: "svc-ai-solutions",
    name: "AI Solutions & Assistants",
    slug: "ai-solutions",
    shortDescription: "Custom AI customer support chatbots, AI calling voice agents, and business intelligence assistants built on cutting-edge models.",
    category: "AI & Tech",
    startingPrice: null,
    priceType: "quote",
    currency: "GBP",
    billingType: "one-time",
    deliverables: [
      "Custom conversational AI chatbot trained on your company data",
      "AI calling agents for inbound triage and appointment setting",
      "Customer support automation & instant escalation",
      "Multi-channel integration (Website, WhatsApp, CRM)"
    ],
    packages: [
      {
        id: "pkg-ai-bot",
        name: "Smart Support Bot",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "Website AI support chatbot",
          "Knowledge base ingestion (FAQ, Services, Pricing)",
          "Lead capture & WhatsApp forward",
          "Analytics & chat logging"
        ],
        deliveryTime: "5â€“8 Business Days",
        revisions: "Fine-tuning prompt adjustments"
      },
      {
        id: "pkg-ai-voice",
        name: "Voice & Workflow Agent",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "AI voice calling or multi-channel assistant",
          "Calendar booking integration",
          "CRM synchronization (HubSpot/Google Sheets)",
          "Custom system instructions & safety guardrails"
        ],
        deliveryTime: "10â€“14 Business Days",
        revisions: "Complete scenario testing",
        recommended: true
      }
    ],
    active: true,
    publicVisible: true,
    order: 4
  },
  {
    id: "svc-automation",
    name: "Business Automation",
    slug: "business-automation",
    shortDescription: "Streamline repetitive operations: automated lead management, booking workflows, instant customer notifications, and CRM sync.",
    category: "Automation",
    startingPrice: null,
    priceType: "quote",
    currency: "GBP",
    billingType: "one-time",
    deliverables: [
      "Automated lead capture & follow-up sequences",
      "WhatsApp & SMS appointment reminders",
      "Invoicing & receipt automation",
      "Multi-app integration (Make, Zapier, Webhooks, Google Sheets)",
      "Zero-overhead operational workflows"
    ],
    packages: [
      {
        id: "pkg-auto-starter",
        name: "Workflow Express",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "Lead-to-CRM automated pipeline",
          "Instant email/WhatsApp notification on inquiry",
          "Google Sheets / Airtable sync"
        ],
        deliveryTime: "3â€“5 Business Days",
        revisions: "2 workflow tests"
      },
      {
        id: "pkg-auto-complete",
        name: "Operations Suite",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "Full client onboarding automation",
          "Automated follow-up drip sequence",
          "Booking cancellation & rescheduling triggers",
          "Document generation & client portal sync"
        ],
        deliveryTime: "7â€“10 Business Days",
        revisions: "Full operational verification",
        recommended: true
      }
    ],
    active: true,
    publicVisible: true,
    order: 5
  },
  {
    id: "svc-seo-ctr",
    name: "SEO & CTR Optimization",
    slug: "seo-ctr-optimization",
    shortDescription: "Data-grounded search visibility: technical audit, semantic metadata, Core Web Vitals acceleration, and click-through rate optimization.",
    category: "Optimization",
    startingPrice: null,
    priceType: "quote",
    currency: "GBP",
    billingType: "monthly",
    deliverables: [
      "In-depth technical SEO architecture audit",
      "Keyword research & search intent mapping",
      "Core Web Vitals performance tuning (95+ speed)",
      "High-converting CTR metadata & rich snippet schemas",
      "Conversion-focused landing page refinements"
    ],
    packages: [
      {
        id: "pkg-seo-audit",
        name: "Technical Audit & Sprint",
        price: null,
        currency: "GBP",
        billingType: "one-time",
        deliverables: [
          "Full 50+ point technical audit",
          "Page speed & Core Web Vitals remediation",
          "Schema.org markup implementation",
          "Actionable keyword roadmap"
        ],
        deliveryTime: "5â€“7 Business Days",
        revisions: "Implementation check"
      },
      {
        id: "pkg-seo-growth",
        name: "Ongoing Search & CTR Retainer",
        price: null,
        currency: "GBP",
        billingType: "monthly",
        deliverables: [
          "Continuous on-page content optimization",
          "Search visibility monitoring & weekly indexing checks",
          "A/B testing titles & meta descriptions for CTR",
          "Transparent monthly search progress reports"
        ],
        deliveryTime: "Monthly Retainer",
        revisions: "Continuous adjustments",
        recommended: true
      }
    ],
    active: true,
    publicVisible: true,
    order: 6
  }
];

const DEFAULT_PORTFOLIO: PortfolioProject[] = [
  {
    id: "proj-lumina-nordic",
    title: "Nordic Architectural Living",
    clientName: "Lumina Studio",
    serviceCategory: "Website Design & Development",
    description: "Architectural portfolio website with ultra-refined typography, editorial grids, and interactive spatial galleries built for an international luxury studio.",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://mrcraftstudio.com",
    completionDate: "2026-03-10",
    status: "Published",
    results: ["Sub-second page loads globally", "Mobile inquiry conversion lifted by 42%", "Featured in curated design galleries"],
    tags: ["React", "Cinematic UI", "Tailwind", "Architecture"],
    featured: true
  },
  {
    id: "proj-kura-culinary",
    title: "Kura Modern Dining & Omakase",
    clientName: "Kura Culinary Group",
    serviceCategory: "Website Design & Development",
    description: "Sensory digital experience for a fine-dining establishment featuring real-time table reservations, interactive seasonal tasting menus, and seamless WhatsApp concierge.",
    thumbnail: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
    beforeImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://mrcraftstudio.com",
    completionDate: "2026-02-18",
    status: "Published",
    results: ["100% automated table inquiries", "Zero reservation double-bookings", "Over 1,200 monthly online reservations"],
    tags: ["Restaurant Web", "Booking System", "WhatsApp", "Dark Theme"],
    featured: true
  },
  {
    id: "proj-aether-bot",
    title: "Aether AI Customer Assistant",
    clientName: "Aether Logistics",
    serviceCategory: "AI Solutions",
    description: "Multilingual AI support agent deployed across web and messaging channels, resolving 78% of client inquiries in seconds without human agent intervention.",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    websiteUrl: "https://mrcraftstudio.com",
    completionDate: "2026-03-24",
    status: "Published",
    results: ["24/7 instant response rate", "Customer satisfaction rating at 4.9/5", "Average response time dropped from 4 hours to 3 seconds"],
    tags: ["Gemini AI", "Automations", "Customer Service", "Live Triage"],
    featured: true
  },
  {
    id: "proj-vanguard-brand",
    title: "Vanguard Brand & Social Identity",
    clientName: "Vanguard Wealth Partners",
    serviceCategory: "Graphic Design",
    description: "Complete visual rebranding including bespoke monoline logo, luxury typography guidelines, and 30+ reusable social media creative assets.",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    websiteUrl: "https://mrcraftstudio.com",
    completionDate: "2026-01-30",
    status: "Published",
    results: ["Unified visual presence across LinkedIn and Instagram", "High engagement rate on thought leadership graphics"],
    tags: ["Brand Identity", "Minimalism", "Logo Design", "Editorial"],
    featured: false
  },
  {
    id: "proj-nexus-automation",
    title: "Nexus Lead & Operations Engine",
    clientName: "Nexus Global Logistics",
    serviceCategory: "Business Automation",
    description: "Automated end-to-end quotation workflows, instant WhatsApp customer dispatch alerts, and bidirectional CRM synchronization saving 35+ operational hours weekly.",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    beforeImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://mrcraftstudio.com",
    completionDate: "2026-03-05",
    status: "Published",
    results: ["35+ operational hours saved weekly", "Quotation response time cut from 6 hours to 15 seconds", "100% automated booking calendar synchronization"],
    tags: ["Automation", "Workflows", "WhatsApp API", "CRM Sync"],
    featured: true
  }
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "MRC-94021",
    serviceId: "svc-web-dev",
    serviceName: "Website Design & Development",
    packageName: "Professional Flagship",
    clientName: "Sophia Richardson",
    email: "sophia.r@richardsonmedia.co.uk",
    phone: "+44 7700 900123",
    businessName: "Richardson Media",
    websiteUrl: "https://richardsonmedia.co.uk",
    requirements: "Need a complete website overhaul with cinematic dark mode aesthetic, interactive client inquiries, and fast loading speed.",
    preferredDate: "2026-10-20",
    timeSlot: "11:00 AM",
    clientTimeZone: "Europe/London",
    status: "confirmed",
    adminNotes: "Client prefers Zoom meeting. Send portfolio samples ahead of call.",
    createdAt: "2026-10-10T14:22:00.000Z",
    updatedAt: "2026-10-10T16:00:00.000Z"
  },
  {
    id: "MRC-83149",
    serviceId: "svc-ai-solutions",
    serviceName: "AI Solutions & Assistants",
    packageName: "Smart Support Bot",
    clientName: "Hamza Tariq",
    email: "hamza@fintechpk.org",
    phone: "+92 300 1234567",
    businessName: "Fintech Horizon",
    requirements: "Looking for an AI chatbot for our customer portal that answers product questions and directs high-value leads to WhatsApp.",
    preferredDate: "2026-10-22",
    timeSlot: "02:00 PM",
    clientTimeZone: "Asia/Karachi",
    status: "pending",
    adminNotes: "Inquiry received via website assistant.",
    createdAt: "2026-10-12T09:15:00.000Z",
    updatedAt: "2026-10-12T09:15:00.000Z"
  }
];

const DEFAULT_INQUIRIES: LeadInquiry[] = [
  {
    id: "inq-101",
    clientName: "David Sterling",
    email: "david@sterlingcapital.com",
    phone: "+44 20 7946 0991",
    businessName: "Sterling Capital",
    serviceCategory: "Website Design & Development",
    message: "Interested in a luxury website redesign for our private equity firm. Please share available consultation dates.",
    status: "new",
    source: "Hero Consultation CTA",
    createdAt: "2026-10-11T11:45:00.000Z"
  }
];

// Helper to dispatch server-side webhook notification for bookings
async function sendBookingWebhookNotification(booking: Booking, settings: WebsiteSettings) {
  const webhookUrl = settings.adminNotificationWebhookUrl || process.env.NOTIFICATION_WEBHOOK_URL;
  const targetEmail = settings.adminNotificationEmail || settings.email || 'mr.craft.studio21@gmail.com';

  const payload = {
    event: 'booking.created',
    timestamp: new Date().toISOString(),
    recipientAdminEmail: targetEmail,
    booking: {
      id: booking.id,
      clientName: booking.clientName,
      clientEmail: booking.email,
      clientPhone: booking.phone,
      businessName: booking.businessName || 'N/A',
      websiteUrl: booking.websiteUrl || 'N/A',
      serviceName: booking.serviceName,
      packageName: booking.packageName || 'Custom Consultation',
      preferredDate: booking.preferredDate,
      timeSlot: booking.timeSlot,
      clientTimeZone: booking.clientTimeZone,
      requirements: booking.requirements,
      status: booking.status,
      createdAt: booking.createdAt,
    },
    quickActions: {
      whatsAppCustomerUrl: `https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`,
      mailtoCustomerUrl: `mailto:${booking.email}?subject=${encodeURIComponent(`MR. CRAFT STUDIO: Consultation Confirmation (${booking.id})`)}`,
    },
    emailNotificationTemplate: {
      to: targetEmail,
      subject: `ðŸš¨ [NEW STUDIO BOOKING] ${booking.id} â€” ${booking.clientName} (${booking.serviceName})`,
      summary: `A new client appointment has been reserved on MR. CRAFT STUDIO.\n\nBooking ID: ${booking.id}\nClient: ${booking.clientName}\nEmail: ${booking.email}\nPhone/WhatsApp: ${booking.phone}\nBusiness: ${booking.businessName || 'N/A'}\nService: ${booking.serviceName} (${booking.packageName || 'Custom'})\nDate: ${booking.preferredDate} at ${booking.timeSlot} (${booking.clientTimeZone})\n\nScope Requirements:\n${booking.requirements}\n\nClient WhatsApp: https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`,
    },
  };

  if (webhookUrl && settings.enableWebhookNotifications !== false) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MR-Craft-Studio-Webhook/1.0',
          'X-Studio-Event': 'booking.created',
        },
        body: JSON.stringify(payload),
      });

      console.log(`[WEBHOOK DISPATCHED] Status ${response.status} to ${webhookUrl} for booking ${booking.id}`);
      return { success: response.ok, status: response.status, url: webhookUrl };
    } catch (err: any) {
      console.error(`[WEBHOOK ERROR] Failed to deliver to ${webhookUrl}:`, err.message);
      return { success: false, error: err.message, url: webhookUrl };
    }
  } else {
    console.log(`[SIMULATED WEBHOOK EMAIL] Alert for booking ${booking.id} routed to owner ${targetEmail}`);
    return { success: true, simulated: true, recipient: targetEmail };
  }
}

// Server-side session secret loaded strictly from environment variable
// NEVER exposed to frontend code or public files
const ADMIN_SESSION_SECRET: string = process.env.ADMIN_SESSION_SECRET || '';

if (!ADMIN_SESSION_SECRET || ADMIN_SESSION_SECRET.length < 32) {
  throw new Error('ADMIN_SESSION_SECRET must be set to a secure secret of at least 32 characters.');
}
// Default initial studio admin password; hashed on start if not already in DB
// Never use the session secret as the login password
const DEFAULT_INITIAL_ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD || '';
if (!DEFAULT_INITIAL_ADMIN_PASSWORD || DEFAULT_INITIAL_ADMIN_PASSWORD.length < 12) {
  throw new Error('ADMIN_PASSWORD must be set to a secure password of at least 12 characters.');
}

// Cryptographic password hashing using Node scrypt
function hashPassword(password: string, customSalt?: string): { salt: string; hash: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64);
  return { salt, hash: derived.toString('hex') };
}

function verifyPasswordAgainstHash(password: string, salt: string, storedHash: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

// Session Token Generation & HMAC Verification using ADMIN_SESSION_SECRET
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function generateAdminSessionToken(): { token: string; sessionId: string; expiresAt: number } {
  const sessionId = crypto.randomBytes(16).toString('hex');
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_DURATION_MS;
  const payload = `${sessionId}.${issuedAt}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('hex');
  const token = `${payload}.${signature}`;
  return { token, sessionId, expiresAt };
}

function verifyAdminSessionToken(token: string): { valid: boolean; sessionId?: string; expiresAt?: number } {
  if (!token || typeof token !== 'string') return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 4) return { valid: false };

  const [sessionId, issuedAtStr, expiresAtStr, signature] = parts;
  const issuedAt = parseInt(issuedAtStr, 10);
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(issuedAt) || isNaN(expiresAt)) return { valid: false };
  if (Date.now() > expiresAt) return { valid: false };

  const payload = `${sessionId}.${issuedAt}.${expiresAt}`;
  const expectedSig = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('hex');

  const sigBuf = Buffer.from(signature, 'hex');
  const expSigBuf = Buffer.from(expectedSig, 'hex');
  if (sigBuf.length !== expSigBuf.length) return { valid: false };

  if (!crypto.timingSafeEqual(sigBuf, expSigBuf)) return { valid: false };

  return { valid: true, sessionId, expiresAt };
}

// Helper to safely read and write database
function readDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const initialAuth = hashPassword(DEFAULT_INITIAL_ADMIN_PASSWORD);

  if (!fs.existsSync(DB_PATH)) {
    const initialDb: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      services: DEFAULT_SERVICES,
      portfolio: DEFAULT_PORTFOLIO,
      bookings: DEFAULT_BOOKINGS,
      inquiries: DEFAULT_INQUIRIES,
      roadmap: DEFAULT_ROADMAP,
      adminTokens: [],
      adminSessions: [],
      adminAuth: {
        passwordSalt: initialAuth.salt,
        passwordHash: initialAuth.hash,
        lastUpdated: new Date().toISOString()
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    let adminAuth = parsed.adminAuth;
    if (!adminAuth || !adminAuth.passwordHash) {
      adminAuth = {
        passwordSalt: initialAuth.salt,
        passwordHash: initialAuth.hash,
        lastUpdated: new Date().toISOString()
      };
    }

    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      services: parsed.services || DEFAULT_SERVICES,
      portfolio: parsed.portfolio || DEFAULT_PORTFOLIO,
      bookings: parsed.bookings || DEFAULT_BOOKINGS,
      inquiries: parsed.inquiries || DEFAULT_INQUIRIES,
      roadmap: parsed.roadmap || DEFAULT_ROADMAP,
      adminTokens: parsed.adminTokens || [],
      adminSessions: parsed.adminSessions || [],
      adminAuth,
    };
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      settings: DEFAULT_SETTINGS,
      services: DEFAULT_SERVICES,
      portfolio: DEFAULT_PORTFOLIO,
      bookings: DEFAULT_BOOKINGS,
      inquiries: DEFAULT_INQUIRIES,
      roadmap: DEFAULT_ROADMAP,
      adminTokens: [],
      adminSessions: [],
      adminAuth: {
        passwordSalt: initialAuth.salt,
        passwordHash: initialAuth.hash,
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

function writeDatabase(db: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}

// Security: Verify admin session token signed with ADMIN_SESSION_SECRET
function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing or invalid authentication token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const verified = verifyAdminSessionToken(token);
  if (!verified.valid || !verified.sessionId) {
    res.status(401).json({ error: 'Unauthorized: invalid or expired session token' });
    return;
  }

  const db = readDatabase();
  const sessionActive = (db.adminSessions || []).some(
    s => s.sessionId === verified.sessionId && s.expiresAt > Date.now()
  );

  if (!sessionActive) {
    res.status(403).json({ error: 'Forbidden: session has been invalidated or expired' });
    return;
  }

  (req as any).adminSession = {
    sessionId: verified.sessionId,
    expiresAt: verified.expiresAt
  };
  next();
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

  // Initialize DB on start
  readDatabase();

  // -------------------------------------------------------------
  // PUBLIC API ENDPOINTS
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'MR. CRAFT STUDIO Backend', timestamp: new Date().toISOString() });
  });

  // Public Settings
  app.get('/api/settings', (req, res) => {
    const db = readDatabase();
    res.json(db.settings);
  });

  // Public Services & Pricing
  app.get('/api/services', (req, res) => {
    const db = readDatabase();
    const publicServices = db.services.filter(s => s.active && s.publicVisible);
    res.json(publicServices);
  });

  // Public Portfolio
  app.get('/api/portfolio', (req, res) => {
    const db = readDatabase();
    const published = db.portfolio.filter(p => p.status === 'Published');
    res.json(published);
  });

  // Slot Availability Check
  app.get('/api/availability', (req, res) => {
    const dateStr = req.query.date as string;
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      res.status(400).json({ error: 'Valid date query param (YYYY-MM-DD) required' });
      return;
    }

    const db = readDatabase();
    const selectedDate = new Date(dateStr);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Check blocked dates
    if (db.settings.blockedDates?.includes(dateStr)) {
      res.json({ availableSlots: [], reason: 'Studio date blocked or holiday' });
      return;
    }

    // Check working days
    if (!db.settings.workingDays?.includes(dayName)) {
      res.json({ availableSlots: [], reason: `${dayName} is not a studio consultation day` });
      return;
    }

    // Standard business slots (09:00 to 18:00 in 60-min increments)
    const baseSlots = [
      '09:00 AM',
      '10:00 AM',
      '11:00 AM',
      '01:00 PM',
      '02:00 PM',
      '03:00 PM',
      '04:00 PM',
      '05:00 PM'
    ];

    // Find taken slots on this date (confirmed or pending)
    const takenSlots = db.bookings
      .filter(b => b.preferredDate === dateStr && (b.status === 'confirmed' || b.status === 'pending'))
      .map(b => b.timeSlot);

    const availableSlots = baseSlots.filter(s => !takenSlots.includes(s));
    res.json({ date: dateStr, day: dayName, availableSlots, takenSlots });
  });

  // Submit Booking
  app.post('/api/bookings', async (req, res) => {
    const {
      serviceId,
      serviceName,
      packageName,
      clientName,
      email,
      phone,
      businessName,
      websiteUrl,
      requirements,
      preferredDate,
      timeSlot,
      clientTimeZone
    } = req.body;

    // Strict validation
    if (!clientName || !clientName.trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      res.status(400).json({ error: 'Valid email address is required' });
      return;
    }
    if (!phone || phone.trim().length < 7) {
      res.status(400).json({ error: 'Valid phone/WhatsApp number is required' });
      return;
    }
    if (!preferredDate || !timeSlot) {
      res.status(400).json({ error: 'Preferred date and time slot are required' });
      return;
    }
    if (!requirements || requirements.trim().length < 5) {
      res.status(400).json({ error: 'Please share brief requirements or project goals' });
      return;
    }

    const db = readDatabase();

    // Prevent collision on same date & time slot
    const existing = db.bookings.find(
      b => b.preferredDate === preferredDate && b.timeSlot === timeSlot && (b.status === 'confirmed' || b.status === 'pending')
    );
    if (existing) {
      res.status(409).json({ error: `The slot ${timeSlot} on ${preferredDate} was just reserved. Please select another slot.` });
      return;
    }

    // Generate unique reference number MRC-XXXXX
    const refCode = `MRC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking: Booking = {
      id: refCode,
      serviceId: serviceId || 'general',
      serviceName: serviceName || 'General Consultation',
      packageName: packageName || 'Custom',
      clientName: clientName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      businessName: businessName?.trim() || '',
      websiteUrl: websiteUrl?.trim() || '',
      requirements: requirements.trim(),
      preferredDate,
      timeSlot,
      clientTimeZone: clientTimeZone || 'UTC',
      status: 'pending',
      webhookStatus: 'pending',
      adminNotes: 'Submitted via online studio reservation form',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Automated server-side webhook notification dispatch
    try {
      const webhookRes = await sendBookingWebhookNotification(newBooking, db.settings);
      newBooking.webhookStatus = webhookRes.success ? (webhookRes.simulated ? 'simulated' : 'sent') : 'failed';
      newBooking.webhookDeliveredAt = new Date().toISOString();
    } catch (err: any) {
      console.error('Webhook notification dispatch error:', err);
      newBooking.webhookStatus = 'failed';
    }

    db.bookings.unshift(newBooking);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      booking: newBooking,
      webhookDispatched: newBooking.webhookStatus,
      message: 'Booking successfully confirmed, recorded, and owner alerted via webhook notification.'
    });
  });

  // Public Studio Roadmap
  app.get('/api/roadmap', (req, res) => {
    const db = readDatabase();
    res.json(db.roadmap || DEFAULT_ROADMAP);
  });

  // Booking Lookup by Reference
  app.get('/api/bookings/lookup', (req, res) => {
    const ref = (req.query.ref as string)?.trim().toUpperCase();
    if (!ref) {
      res.status(400).json({ error: 'Booking reference is required' });
      return;
    }

    const db = readDatabase();
    const found = db.bookings.find(b => b.id.toUpperCase() === ref);
    if (!found) {
      res.status(404).json({ error: `No booking found matching reference ${ref}` });
      return;
    }

    // Return sanitized booking details to client
    res.json({
      id: found.id,
      serviceName: found.serviceName,
      packageName: found.packageName,
      clientName: found.clientName,
      preferredDate: found.preferredDate,
      timeSlot: found.timeSlot,
      status: found.status,
      createdAt: found.createdAt
    });
  });

  // General Inquiries & Consultation Leads
  app.post('/api/inquiries', (req, res) => {
    const { clientName, email, phone, businessName, serviceCategory, message } = req.body;
    if (!clientName || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required' });
      return;
    }

    const db = readDatabase();
    const newLead: LeadInquiry = {
      id: `inq-${Date.now()}`,
      clientName: clientName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      businessName: businessName?.trim() || '',
      serviceCategory: serviceCategory || 'General',
      message: message.trim(),
      status: 'new',
      source: 'Website Contact Form',
      createdAt: new Date().toISOString()
    };

    db.inquiries.unshift(newLead);
    writeDatabase(db);

    res.status(201).json({ success: true, message: 'Inquiry received. Studio team will respond within 24 hours.' });
  });

  // -------------------------------------------------------------
  // AI CHATBOT ENDPOINT (Server-Side Gemini 3.8 Flash)
  // -------------------------------------------------------------
  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const db = readDatabase();
    const settings = db.settings;
    const servicesList = db.services
      .filter(s => s.active)
      .map(s => `- ${s.name} (${s.category}): ${s.shortDescription}. Deliverables: ${s.deliverables.slice(0, 3).join(', ')}. Packages: ${s.packages.map(p => p.name).join(', ')}. Starting price: ${s.startingPrice ? `${s.currency} ${s.startingPrice}` : 'Custom Quote'}`)
      .join('\n');

    const portfolioList = db.portfolio
      .filter(p => p.status === 'Published')
      .map(p => `- ${p.title} for ${p.clientName} (${p.serviceCategory}): ${p.description}`)
      .join('\n');

    const systemInstruction = `
You are the official AI Support Assistant for "MR. CRAFT STUDIO".
Brand Tagline: "${settings.tagline}"

Core Capabilities:
- Provide friendly, highly professional, luxury-aesthetic answers.
- Explain the studio's 6 core services:
  1. Website Design & Development (business websites, restaurant/food sites, landing pages, e-commerce, booking systems)
  2. Graphic Design (brand identity, logos, social media creatives, marketing materials)
  3. Social Media Management (content planning, post production, brand consistency)
  4. AI Solutions (AI chatbots, AI calling agents, customer support automation, business assistants)
  5. Business Automation (lead management, booking workflows, notification alerts, automated follow-ups)
  6. SEO & CTR Optimization (technical SEO, speed, visibility, conversion landing pages, CTR optimization)

Pricing Rules:
- NEVER fabricate fixed prices. If a price is not explicitly set, state: "Please contact us for a custom quote."
- Current services and packages configured in studio database:
${servicesList}

Portfolio:
${portfolioList}

Official Contact Details:
- WhatsApp Support: ${settings.whatsappNumber} (International: ${settings.whatsappIntl})
- WhatsApp Direct Link: ${settings.whatsappLink}
- Official Email: ${settings.email}
- Instagram: ${settings.instagramUrl}
- TikTok: ${settings.tiktokUrl}

Booking Availability:
- Consultation appointments are available Monday through Saturday (${settings.businessHoursStart} to ${settings.businessHoursEnd}).
- Clients can book a consultation directly on the site or connect via WhatsApp for an immediate discussion.

Important Boundaries:
- Do not make guaranteed promises of specific Google rankings, CTR figures, or guaranteed sales.
- Never invent past clients, fabricated testimonials, or unverified facts.
- Keep responses concise, articulate, and welcoming.
`;

    // Attempt Gemini call with fallback
    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback response when API key is not present
      res.json({
        reply: `Welcome to MR. CRAFT STUDIO. We design high-performance websites, distinctive brand identities, AI chatbots, and business automations. For immediate assistance or a personalized quote, feel free to message our team directly on WhatsApp (+923105603564) or email us at mr.craft.studio21@gmail.com.`,
        quickActions: [
          { label: 'Explore Services', action: 'services' },
          { label: 'Book a Consultation', action: 'booking' },
          { label: 'Chat on WhatsApp', action: 'whatsapp' },
          { label: 'View Portfolio', action: 'portfolio' }
        ]
      });
      return;
    }

    try {
      // Build contents array with context
      const chatContents = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          chatContents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }]
          });
        }
      }

      chatContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: chatContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || 'How can MR. CRAFT STUDIO assist your business today?';

      res.json({
        reply: replyText,
        quickActions: [
          { label: 'Book Consultation', action: 'booking' },
          { label: 'WhatsApp Direct', action: 'whatsapp' },
          { label: 'View Services', action: 'services' }
        ]
      });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      res.json({
        reply: `Thank you for reaching out to MR. CRAFT STUDIO. Our team is ready to help you with web development, branding, AI solutions, and automation. You can connect with us directly on WhatsApp at ${settings.whatsappIntl} or email ${settings.email}.`,
        quickActions: [
          { label: 'Book Consultation', action: 'booking' },
          { label: 'Chat on WhatsApp', action: 'whatsapp' }
        ]
      });
    }
  });

  // -------------------------------------------------------------
  // ADMIN DASHBOARD AUTH & PROTECTED ENDPOINTS
  // -------------------------------------------------------------

  // Failed login rate limiting map
  const failedAttempts = new Map<string, { count: number; lockUntil: number }>();

  // Admin Login (Verifies against salted scrypt hash; uses ADMIN_SESSION_SECRET for cryptographic token)
  app.post('/api/admin/login', (req, res) => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Rate limiting check: 5 failed attempts locks for 5 minutes
    const rateRecord = failedAttempts.get(clientIp);
    if (rateRecord && rateRecord.lockUntil > now) {
      const waitSeconds = Math.ceil((rateRecord.lockUntil - now) / 1000);
      res.status(429).json({
        error: `Too many failed authentication attempts. Access locked for ${waitSeconds} seconds for security.`
      });
      return;
    }

    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'Password required' });
      return;
    }

    // Security check: Session secret must NOT be used as the login password
    if (password === ADMIN_SESSION_SECRET) {
      res.status(401).json({
        error: 'Security rejection: The session secret cannot be used as the login password. Please use your administrator password.'
      });
      return;
    }

    const db = readDatabase();

    // Determine target password hash and salt
    let targetSalt = db.adminAuth?.passwordSalt;
    let targetHash = db.adminAuth?.passwordHash;

    // If pre-configured in environment variable ADMIN_PASSWORD_HASH="salt:hash"
    if (process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.includes(':')) {
      const [envSalt, envHash] = process.env.ADMIN_PASSWORD_HASH.split(':');
      if (envSalt && envHash) {
        targetSalt = envSalt;
        targetHash = envHash;
      }
    }

    if (!targetSalt || !targetHash) {
      // Re-bootstrap if missing
      const initial = hashPassword(DEFAULT_INITIAL_ADMIN_PASSWORD);
      targetSalt = initial.salt;
      targetHash = initial.hash;
      db.adminAuth = {
        passwordSalt: targetSalt,
        passwordHash: targetHash,
        lastUpdated: new Date().toISOString()
      };
      writeDatabase(db);
    }

    const isMatch = verifyPasswordAgainstHash(password, targetSalt, targetHash);

    if (!isMatch) {
      const attempts = (rateRecord?.count || 0) + 1;
      const lockUntil = attempts >= 5 ? now + 5 * 60 * 1000 : 0;
      failedAttempts.set(clientIp, { count: attempts, lockUntil });

      const remaining = Math.max(0, 5 - attempts);
      res.status(401).json({
        error: attempts >= 5
          ? 'Incorrect password. Account temporarily locked for 5 minutes.'
          : `Incorrect administrator password. ${remaining} attempt(s) remaining before temporary lockout.`
      });
      return;
    }

    // Reset rate limiter on successful login
    failedAttempts.delete(clientIp);

    // Generate cryptographic session token signed with ADMIN_SESSION_SECRET
    const session = generateAdminSessionToken();

    if (!db.adminSessions) db.adminSessions = [];
    // Prune expired sessions
    db.adminSessions = db.adminSessions.filter(s => s.expiresAt > now);
    db.adminSessions.push({
      sessionId: session.sessionId,
      token: session.token,
      createdAt: new Date().toISOString(),
      expiresAt: session.expiresAt
    });

    // Also track in adminTokens for legacy support
    if (!db.adminTokens) db.adminTokens = [];
    db.adminTokens.push(session.token);
    if (db.adminTokens.length > 20) {
      db.adminTokens = db.adminTokens.slice(-20);
    }

    writeDatabase(db);

    res.json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      message: 'Authentication successful. Welcome to MR. CRAFT STUDIO Admin Console.'
    });
  });

  // Admin Session Verification
  app.get('/api/admin/verify', verifyAdmin, (req, res) => {
    const session = (req as any).adminSession;
    res.json({
      authenticated: true,
      sessionId: session?.sessionId,
      expiresAt: session?.expiresAt,
      message: 'Active session verified successfully'
    });
  });

  // Admin Change Password (Re-hashes with fresh cryptographic salt)
  app.post('/api/admin/change-password', verifyAdmin, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both current password and new password are required' });
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }

    if (newPassword === ADMIN_SESSION_SECRET) {
      res.status(400).json({ error: 'The new password cannot be the session secret' });
      return;
    }

    const db = readDatabase();
    const currentSalt = db.adminAuth?.passwordSalt;
    const currentHash = db.adminAuth?.passwordHash;

    if (currentSalt && currentHash) {
      const match = verifyPasswordAgainstHash(currentPassword, currentSalt, currentHash);
      if (!match) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }
    }

    // Generate new salted hash
    const newAuth = hashPassword(newPassword);
    db.adminAuth = {
      passwordSalt: newAuth.salt,
      passwordHash: newAuth.hash,
      lastUpdated: new Date().toISOString()
    };

    writeDatabase(db);

    res.json({
      success: true,
      message: 'Administrator password has been successfully updated and cryptographically hashed'
    });
  });

  // Admin Logout (Revokes session)
  app.post('/api/admin/logout', verifyAdmin, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    const sessionInfo = (req as any).adminSession;

    if (token || sessionInfo) {
      const db = readDatabase();
      if (sessionInfo?.sessionId && db.adminSessions) {
        db.adminSessions = db.adminSessions.filter(s => s.sessionId !== sessionInfo.sessionId);
      }
      if (token && db.adminTokens) {
        db.adminTokens = db.adminTokens.filter(t => t !== token);
      }
      writeDatabase(db);
    }
    res.json({ success: true, message: 'Logged out successfully; session invalidated' });
  });

  // Admin Overview Statistics
  app.get('/api/admin/stats', verifyAdmin, (req, res) => {
    const db = readDatabase();
    const totalInquiries = db.inquiries.length;
    const totalBookings = db.bookings.length;
    const newBookings = db.bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = db.bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = db.bookings.filter(b => b.status === 'completed').length;
    const publishedProjects = db.portfolio.filter(p => p.status === 'Published').length;
    const activeServices = db.services.filter(s => s.active).length;

    res.json({
      totalInquiries,
      totalBookings,
      newBookings,
      confirmedBookings,
      completedBookings,
      publishedProjects,
      activeServices
    });
  });

  // Admin Bookings List & Filter
  app.get('/api/admin/bookings', verifyAdmin, (req, res) => {
    const db = readDatabase();
    const { status, search } = req.query;

    let list = [...db.bookings];
    if (status && status !== 'all') {
      list = list.filter(b => b.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        b =>
          b.clientName.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          (b.businessName && b.businessName.toLowerCase().includes(q))
      );
    }

    res.json(list);
  });

  // Admin Update Booking (confirm, reject, change slot, admin notes)
  app.put('/api/admin/bookings/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const db = readDatabase();

    const idx = db.bookings.findIndex(b => b.id.toUpperCase() === id.toUpperCase());
    if (idx === -1) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    db.bookings[idx] = {
      ...db.bookings[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    writeDatabase(db);
    res.json({ success: true, booking: db.bookings[idx] });
  });

  // Admin Delete Booking
  app.delete('/api/admin/bookings/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    const prevCount = db.bookings.length;
    db.bookings = db.bookings.filter(b => b.id.toUpperCase() !== id.toUpperCase());
    if (db.bookings.length === prevCount) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    writeDatabase(db);
    res.json({ success: true, message: 'Booking removed successfully' });
  });

  // Admin Export Bookings CSV
  app.get('/api/admin/bookings/export-csv', verifyAdmin, (req, res) => {
    const db = readDatabase();
    const headers = ['Booking ID', 'Status', 'Client Name', 'Email', 'Phone', 'Business', 'Service', 'Package', 'Date', 'Time Slot', 'Requirements', 'Created At'];
    const rows = db.bookings.map(b => [
      b.id,
      b.status,
      `"${b.clientName.replace(/"/g, '""')}"`,
      b.email,
      b.phone,
      `"${(b.businessName || '').replace(/"/g, '""')}"`,
      `"${b.serviceName.replace(/"/g, '""')}"`,
      `"${(b.packageName || '').replace(/"/g, '""')}"`,
      b.preferredDate,
      b.timeSlot,
      `"${b.requirements.replace(/"/g, '""')}"`,
      b.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=mr-craft-bookings-${Date.now()}.csv`);
    res.send(csvContent);
  });

  // Admin Services Management (Get all, Add, Edit, Delete)
  app.get('/api/admin/services', verifyAdmin, (req, res) => {
    const db = readDatabase();
    res.json(db.services);
  });

  app.post('/api/admin/services', verifyAdmin, (req, res) => {
    const newService: ServiceItem = req.body;
    if (!newService.name || !newService.shortDescription) {
      res.status(400).json({ error: 'Service name and description required' });
      return;
    }
    const db = readDatabase();
    newService.id = `svc-${Date.now()}`;
    db.services.push(newService);
    writeDatabase(db);
    res.status(201).json(newService);
  });

  app.put('/api/admin/services/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    const idx = db.services.findIndex(s => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    db.services[idx] = { ...db.services[idx], ...req.body };
    writeDatabase(db);
    res.json(db.services[idx]);
  });

  app.delete('/api/admin/services/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    db.services = db.services.filter(s => s.id !== id);
    writeDatabase(db);
    res.json({ success: true });
  });

  // Admin Portfolio Management
  app.get('/api/admin/portfolio', verifyAdmin, (req, res) => {
    const db = readDatabase();
    res.json(db.portfolio);
  });

  app.post('/api/admin/portfolio', verifyAdmin, (req, res) => {
    const newProj: PortfolioProject = req.body;
    if (!newProj.title || !newProj.clientName) {
      res.status(400).json({ error: 'Project title and client name required' });
      return;
    }
    const db = readDatabase();
    newProj.id = `proj-${Date.now()}`;
    db.portfolio.unshift(newProj);
    writeDatabase(db);
    res.status(201).json(newProj);
  });

  app.put('/api/admin/portfolio/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    const idx = db.portfolio.findIndex(p => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    db.portfolio[idx] = { ...db.portfolio[idx], ...req.body };
    writeDatabase(db);
    res.json(db.portfolio[idx]);
  });

  app.delete('/api/admin/portfolio/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    db.portfolio = db.portfolio.filter(p => p.id !== id);
    writeDatabase(db);
    res.json({ success: true });
  });

  // Admin Inquiries / Leads
  app.get('/api/admin/inquiries', verifyAdmin, (req, res) => {
    const db = readDatabase();
    res.json(db.inquiries);
  });

  app.put('/api/admin/inquiries/:id', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDatabase();
    const idx = db.inquiries.findIndex(i => i.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }
    db.inquiries[idx] = { ...db.inquiries[idx], ...req.body };
    writeDatabase(db);
    res.json(db.inquiries[idx]);
  });

  // Admin Update Settings
  app.put('/api/admin/settings', verifyAdmin, (req, res) => {
    const db = readDatabase();
    db.settings = { ...db.settings, ...req.body };
    writeDatabase(db);
    res.json(db.settings);
  });

  // Admin Test Webhook Alert Dispatch
  app.post('/api/admin/test-webhook', verifyAdmin, async (req, res) => {
    const db = readDatabase();
    const testBooking: Booking = {
      id: `MRC-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: 'svc-web-dev',
      serviceName: 'Website Design & Development',
      packageName: 'Professional Flagship',
      clientName: 'Alexander Vance (Webhook Verification)',
      email: 'alexander.vance@studio-test.com',
      phone: '+92 310 5603564',
      businessName: 'Vance Architecture Studio',
      websiteUrl: 'https://mrcraftstudio.com',
      requirements: 'Automated test transmission verifying that server-side webhook email alerts are promptly delivered upon booking submission.',
      preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: '11:00 AM',
      clientTimeZone: 'Europe/London',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await sendBookingWebhookNotification(testBooking, db.settings);
    res.json({
      success: result.success,
      result,
      message: result.simulated
        ? `Test notification simulated & logged to owner email (${result.recipient}). To route externally to Discord/Slack/Zapier/Make, specify your webhook URL in Settings.`
        : `Live webhook successfully transmitted to ${result.url}`
    });
  });

  // Admin Roadmap Management
  app.put('/api/admin/roadmap', verifyAdmin, (req, res) => {
    const db = readDatabase();
    db.roadmap = req.body;
    writeDatabase(db);
    res.json(db.roadmap);
  });

  // -------------------------------------------------------------
  // VITE / STATIC INTEGRATION
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MR. CRAFT STUDIO server live on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

