"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteLeadButtonProps {
  leadId: string;
  leadName: string;
}

export function DeleteLeadButton({ leadId, leadName }: DeleteLeadButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteLead(leadId, true); // soft delete

      if (result.success) {
        router.push("/leads");
        router.refresh();
      } else {
        setError(result.error || "Failed to delete lead");
        setIsDeleting(false);
        setShowConfirm(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">
              Delete "{leadName}"?
            </p>
            <p className="text-sm text-red-700 mt-1">
              This will soft-delete the lead. You can restore it later from the leads list.
            </p>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      onClick={() => setShowConfirm(true)}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete Lead
    </Button>
  );
}
