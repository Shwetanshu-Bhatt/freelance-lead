"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { leadSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ILead, ICategory } from "@/lib/types";
import { statusLabels, sourceLabels, priorityLabels } from "@/lib/utils";
import { createLead, updateLead } from "@/app/actions/leads";

// Extended schema with ratingReview field for combined input
const extendedLeadSchema = leadSchema.extend({
  ratingReview: z.string().regex(
    /^\d+(\.\d+)?\(\d+\)$/,
    "Format must be like 4.5(1234)"
  ).optional(),
});

type LeadFormData = z.infer<typeof extendedLeadSchema>; // Helper function to parse rating review string
function parseRatingReview(value: string): { rating: number; reviewCount: number } | null {
  const match = value.match(/^(\d+(?:\.\d+)?)\((\d+)\)$/);
  if (!match) return null;
  return {
    rating: parseFloat(match[1]),
    reviewCount: parseInt(match[2], 10),
  };
}

// Helper function to format rating and review count
function formatRatingReview(rating: number, reviewCount: number): string {
  return `${rating}(${reviewCount})`;
}

interface LeadFormProps {
  lead?: ILead;
  categories: ICategory[];
  onSuccess?: () => void;
}

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

const sourceOptions = Object.entries(sourceLabels).map(([value, label]) => ({
  value,
  label,
}));

const priorityOptions = Object.entries(priorityLabels).map(([value, label]) => ({
  value,
  label,
}));

export function LeadForm({ lead, categories, onSuccess }: LeadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          category: typeof lead.category === "string" ? lead.category : lead.category._id,
          name: lead.name,
          contactPerson: lead.contactPerson,
          phone: lead.phone,
          email: lead.email,
          rating: lead.rating,
          reviewCount: lead.reviewCount,
          ratingReview: formatRatingReview(lead.rating, lead.reviewCount),
          googleMapsUrl: lead.googleMapsUrl,
          status: lead.status,
          source: lead.source,
          tags: lead.tags,
          notes: lead.notes,
          priority: lead.priority,
        }
      : {
          rating: 0,
          reviewCount: 0,
          ratingReview: "0(0)",
          status: "lead_generated",
          source: "manual",
          priority: "medium",
          tags: [],
        },
  });

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Parse ratingReview to extract rating and reviewCount
      let rating = 0;
      let reviewCount = 0;
      if (data.ratingReview) {
        const parsed = parseRatingReview(data.ratingReview);
        if (parsed) {
          rating = parsed.rating;
          reviewCount = parsed.reviewCount;
        }
      }

      // Prepare submission data without ratingReview field
      const { ratingReview, ...restData } = data;
      const submitData = {
        ...restData,
        rating,
        reviewCount,
      };

      const result = lead
        ? await updateLead(lead._id, submitData)
        : await createLead(submitData);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/leads/${result.data._id}`);
          router.refresh();
        }
      } else {
        setError(result.error || "Failed to save lead");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded-r-lg flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">{error}</p>
            {error.toLowerCase().includes("already exists") && (
              <p className="text-sm text-red-600 mt-1">
                Please use a different name or phone number.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Category *"
              options={categoryOptions}
              error={errors.category?.message}
              {...register("category")}
            />
            <Input
              label="Lead Name"
              placeholder="Enter lead name (optional)"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Contact Person"
              placeholder="Enter contact person name"
              error={errors.contactPerson?.message}
              {...register("contactPerson")}
            />
            <Input
              label="Phone *"
              placeholder="Enter phone number"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              error={errors.email?.message}
              {...register("email")}
            />
          </CardContent>
        </Card>

        {/* Status & Source */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Status"
              options={statusOptions}
              error={errors.status?.message}
              {...register("status")}
            />
            <Select
              label="Source"
              options={sourceOptions}
              error={errors.source?.message}
              {...register("source")}
            />
            <Select
              label="Priority"
              options={priorityOptions}
              error={errors.priority?.message}
              {...register("priority")}
            />
            <Input
              label="Rating & Reviews"
              placeholder="e.g., 4.5(1234)"
              error={errors.ratingReview?.message}
              {...register("ratingReview")}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Google Maps URL"
              placeholder="Enter Google Maps URL"
              error={errors.googleMapsUrl?.message}
              {...register("googleMapsUrl")}
            />
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Notes"
              placeholder="Enter any additional notes..."
              rows={4}
              {...register("notes")}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button type="submit" isLoading={isSubmitting}>
          {lead ? "Update Lead" : "Create Lead"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
