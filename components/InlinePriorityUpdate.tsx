"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Priority } from "@/lib/types";
import { priorityLabels } from "@/lib/utils";
import { updateLead } from "@/app/actions/leads";

interface InlinePriorityUpdateProps {
  leadId: string;
  currentPriority: Priority;
}

const priorityOptions = Object.entries(priorityLabels).map(([value, label]) => ({
  value,
  label,
}));

export function InlinePriorityUpdate({ leadId, currentPriority }: InlinePriorityUpdateProps) {
  const router = useRouter();
  const [priority, setPriority] = useState(currentPriority);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as Priority;
    if (newPriority === priority) return;

    setIsUpdating(true);
    
    try {
      const result = await updateLead(leadId, { priority: newPriority });

      if (result.success) {
        setPriority(newPriority);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update priority:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={priority}
      onChange={handleChange}
      disabled={isUpdating}
      className={`text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {priorityOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
