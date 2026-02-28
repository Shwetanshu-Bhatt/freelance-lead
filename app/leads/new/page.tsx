import { getCategories } from "@/app/actions/categories";
import { LeadForm } from "@/components/LeadForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewLeadPage() {
  const result = await getCategories();
  const categories = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
      </div>

      <LeadForm categories={categories} />
    </div>
  );
}
