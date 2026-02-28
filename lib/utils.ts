import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const statusColors: Record<string, string> = {
  lead_generated: "bg-slate-500",
  contacted: "bg-blue-500",
  declined: "bg-red-500",
  proposed: "bg-yellow-500",
};

export const statusLabels: Record<string, string> = {
  lead_generated: "Lead Generated",
  contacted: "Contacted",
  to_send: "To Send",
  declined: "Declined",
  proposed: "Proposed",
};

export const priorityColors: Record<string, string> = {
  low: "bg-slate-400",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

export const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const sourceLabels: Record<string, string> = {
  manual: "Manual",
  google: "Google",
  referral: "Referral",
  social_media: "Social Media",
  website: "Website",
  other: "Other",
};
