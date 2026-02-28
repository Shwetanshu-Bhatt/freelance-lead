"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { statusLabels } from "@/lib/utils";
import { LeadStatus } from "@/lib/types";
import { updateLeadStatus } from "@/app/actions/leads";

interface QuickStatusUpdateProps {
  leadId: string;
  currentStatus: LeadStatus;
}

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

export function QuickStatusUpdate({ leadId, currentStatus }: QuickStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateLeadStatus(leadId, status as LeadStatus, notes);

      if (result.success) {
        setMessage("Status updated successfully!");
        setNotes("");
        router.refresh();
      } else {
        setMessage(result.error || "Failed to update status");
      }
    } catch (err) {
      setMessage("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Status Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
          />
          <Textarea
            label="Add Note (optional)"
            placeholder="Enter notes about this status change..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {message && (
            <div
              className={`text-sm px-3 py-2 rounded ${
                message.includes("success")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={status === currentStatus && !notes.trim()}
            className="w-full"
          >
            Update Status
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
