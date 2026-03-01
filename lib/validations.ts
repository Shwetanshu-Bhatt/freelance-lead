import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug cannot exceed 100 characters"),
});

export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const leadSchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().max(200, "Name cannot exceed 200 characters").optional().or(z.literal("")),
  contactPerson: z.string().max(100, "Contact person cannot exceed 100 characters").optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().min(0).default(0),
  googleMapsUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: addressSchema.default({}),
  status: z.enum(["lead_generated", "contacted", "to_send", "declined", "proposed"]).default("lead_generated"),
  source: z.enum(["manual", "google", "referral", "social_media", "website", "other"]).default("manual"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const leadUpdateSchema = leadSchema.partial().extend({
  _id: z.string(),
});

export const bulkStatusUpdateSchema = z.object({
  leadIds: z.array(z.string()),
  status: z.enum(["lead_generated", "contacted", "to_send", "declined", "proposed"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
export type BulkStatusUpdateInput = z.infer<typeof bulkStatusUpdateSchema>;
