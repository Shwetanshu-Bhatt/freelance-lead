"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeadForm } from "./LeadForm";
import { ILead, ICategory } from "@/lib/types";
import { Edit } from "lucide-react";

interface EditLeadModalProps {
  lead: ILead;
  categories: ICategory[];
}

export function EditLeadModal({ lead, categories }: EditLeadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSuccess = () => {
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Lead
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={handleClose}
        title="Edit Lead"
        maxWidth="max-w-4xl"
      >
        <LeadForm 
          lead={lead} 
          categories={categories} 
          onSuccess={handleSuccess}
        />
      </Dialog>
    </>
  );
}
