export interface ServicePackage {
  id: string;
  name: string; // Starter, Professional, Premium or Custom
  price: number | null; // null for Request a Quote
  currency: string;
  billingType: 'one-time' | 'monthly';
  deliverables: string[];
  deliveryTime: string;
  revisions: string;
  maintenanceFee?: string;
  recommended?: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  category: string;
  startingPrice: number | null;
  priceType: 'quote' | 'starting_from' | 'fixed';
  currency: string;
  billingType: 'one-time' | 'monthly';
  deliverables: string[];
  packages: ServicePackage[];
  active: boolean;
  publicVisible: boolean;
  order: number;
}

export interface PortfolioProject {
  id: string;
  title: string;
  clientName: string;
  serviceCategory: string;
  description: string;
  thumbnail: string;
  beforeImage?: string;
  afterImage?: string;
  websiteUrl?: string;
  completionDate: string;
  status: 'Published' | 'Draft' | 'Archived';
  results?: string[];
  tags: string[];
  featured?: boolean;
}

export interface Booking {
  id: string; // e.g., MRC-78921
  serviceId: string;
  serviceName: string;
  packageName?: string;
  clientName: string;
  email: string;
  phone: string;
  businessName?: string;
  websiteUrl?: string;
  requirements: string;
  preferredDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "11:00 AM"
  clientTimeZone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  adminNotes?: string;
  webhookStatus?: 'sent' | 'pending' | 'failed' | 'simulated';
  webhookDeliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadInquiry {
  id: string;
  clientName: string;
  email: string;
  phone?: string;
  businessName?: string;
  serviceCategory?: string;
  message: string;
  status: 'new' | 'contacted' | 'in_discussion' | 'converted' | 'closed';
  followUpDate?: string;
  adminNotes?: string;
  source?: string;
  createdAt: string;
}

export interface RoadmapItem {
  id: string;
  quarter: string; // e.g. "Q1 2026"
  title: string;
  category: 'Architecture' | 'AI & Intelligence' | 'Operations' | 'Spatial Design';
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
  deliverables: string[];
  targetDate?: string;
}

export interface WebsiteSettings {
  brandName: string;
  tagline: string;
  email: string;
  adminNotificationEmail?: string;
  adminNotificationWebhookUrl?: string;
  enableWebhookNotifications?: boolean;
  whatsappNumber: string;
  whatsappIntl: string;
  whatsappLink: string;
  instagramUrl: string;
  tiktokUrl: string;
  defaultCurrency: string;
  currencies: string[];
  businessHoursStart: string;
  businessHoursEnd: string;
  workingDays: string[];
  appointmentDurationMin: number;
  bufferMinutes: number;
  blockedDates: string[];
  heroHeadline: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
}
