"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@/lib/types";
import { statusLabels } from "@/lib/utils";
import { updateLeadStatus } from "@/app/actions/leads";

interface InlineStatusUpdateProps {
  leadId: string;
  currentStatus: LeadStatus;
}

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

export function InlineStatusUpdate({ leadId, currentStatus }: InlineStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    if (newStatus === status) return;

    setIsUpdating(true);
    
    try {
      const result = await updateLeadStatus(leadId, newStatus);

      if (result.success) {
        setStatus(newStatus);
        // Refresh the page to reflect the change and move lead to appropriate page
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isUpdating}
      className={`text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
