export type LeadStatus = 
  | "lead_generated"
  | "contacted"
  | "to_send"
  | "declined"
  | "proposed";

export type LeadSource = "manual" | "google" | "referral" | "social_media" | "website" | "other";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: string;
  category: ICategory | string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  rating: number;
  reviewCount: number;
  googleMapsUrl?: string;
  address: IAddress;
  status: LeadStatus;
  source: LeadSource;
  tags: string[];
  notes?: string;
  priority: Priority;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  contactedAt?: Date;
  lastActivityAt?: Date;
}

export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  statusCounts: Record<LeadStatus, number>;
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    avgRating: number;
  }>;
}

export interface LeadFilters {
  category?: string;
  status?: LeadStatus;
  city?: string;
  minRating?: number;
  maxRating?: number;
  search?: string;
  tags?: string[];
  source?: LeadSource;
  priority?: Priority;
  isDeleted?: boolean;
}

export interface LeadSortOptions {
  field: "name" | "rating" | "createdAt" | "updatedAt" | "priority";
  order: "asc" | "desc";
}
