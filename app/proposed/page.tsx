import { getLeads } from "@/app/actions/leads";
import { getCategories } from "@/app/actions/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StarRating } from "@/components/StarRating";
import { InlineStatusUpdate } from "@/components/InlineStatusUpdate";
import { InlineNotes } from "@/components/InlineNotes";
import { InlinePriorityUpdate } from "@/components/InlinePriorityUpdate";
import { ILead } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Search, Phone, Mail } from "lucide-react";

interface ProposedPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProposedPage({ searchParams }: ProposedPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const [leadsResult, categoriesResult] = await Promise.all([
    getLeads(
      { status: "proposed", isDeleted: false, category: params.category, search: params.search },
      { field: "createdAt", order: "desc" },
      page,
      20
    ),
    getCategories(),
  ]);

  const leads: ILead[] = leadsResult.success && leadsResult.data ? leadsResult.data : [];
  const pagination = leadsResult.success && leadsResult.pagination ? leadsResult.pagination : null;
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((cat: { _id: string; name: string }) => ({
      value: cat._id,
      label: cat.name,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proposed Leads</h1>
          <p className="text-slate-500">
            {pagination?.total || 0} leads with offer sent
          </p>
        </div>
        <Link href="/leads/new">
          <Button>Add New Lead</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Search proposed leads..."
                defaultValue={params.search}
                className="pl-10"
              />
            </div>
            <Select
              name="category"
              options={categoryOptions}
              defaultValue={params.category || ""}
              className="sm:w-48"
            />
            <Button type="submit">Filter</Button>
            <Link href="/proposed">
              <Button type="button" variant="outline">Clear</Button>
            </Link>
          </form>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Lead</th>
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Rating</th>
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Priority</th>
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Contact</th>
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Notes</th>
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Updated</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">
                     <td className="px-4 py-3">
                       <Link href={`/leads/${lead._id}`} className="block">
                         <p className="font-semibold text-slate-900 hover:text-blue-600">{lead.name}</p>
                         {lead.contactPerson && (
                           <p className="text-sm text-slate-500">{lead.contactPerson}</p>
                         )}
                       </Link>
                     </td>
                     <td className="px-4 py-3">
                       <InlineStatusUpdate leadId={lead._id} currentStatus={lead.status} />
                     </td>
                     <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">
                        {typeof lead.category === "object" ? lead.category.name : "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={lead.rating} reviewCount={lead.reviewCount} />
                    </td>
                     <td className="px-4 py-3">
                       <InlinePriorityUpdate leadId={lead._id} currentPriority={lead.priority} />
                     </td>
                     <td className="px-4 py-3">
                       <div className="flex flex-col gap-1">
                         {lead.phone && (
                           <a href={`tel:${lead.phone}`} className="flex items-center text-sm text-blue-600 hover:underline">
                             <Phone className="mr-1 h-3 w-3" />
                             {lead.phone}
                           </a>
                         )}
                         {lead.email && (
                           <a href={`mailto:${lead.email}`} className="flex items-center text-sm text-blue-600 hover:underline">
                             <Mail className="mr-1 h-3 w-3" />
                             {lead.email}
                           </a>
                         )}
                       </div>
                     </td>
                     <td className="px-4 py-3">
                       <InlineNotes leadId={lead._id} existingNotes={lead.notes} />
                     </td>
                     <td className="px-4 py-3 text-sm text-slate-600">
                       {formatDate(lead.updatedAt)}
                     </td>
                   </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                     <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No proposed leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Link href={`/proposed?${new URLSearchParams({ ...params, page: String(pagination.page - 1) }).toString()}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link href={`/proposed?${new URLSearchParams({ ...params, page: String(pagination.page + 1) }).toString()}`}>
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
