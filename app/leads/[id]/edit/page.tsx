import { notFound } from "next/navigation";
import Link from "next/link";
import { getLeadById } from "@/app/actions/leads";
import { getCategories } from "@/app/actions/categories";
import { LeadForm } from "@/components/LeadForm";
import { DeleteLeadButton } from "@/components/DeleteLeadButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params;
  
  const [leadResult, categoriesResult] = await Promise.all([
    getLeadById(id),
    getCategories(),
  ]);

  if (!leadResult.success || !leadResult.data) {
    notFound();
  }

  const lead = leadResult.data;
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/leads/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
        </div>
        <DeleteLeadButton leadId={lead._id} leadName={lead.name} />
      </div>

      <LeadForm lead={lead} categories={categories} />
    </div>
  );
}
