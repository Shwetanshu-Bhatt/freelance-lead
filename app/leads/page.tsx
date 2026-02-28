import { getLeads, getAllTags, getCities } from "@/app/actions/leads";
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
import { ILead, LeadStatus, LeadSource, Priority } from "@/lib/types";
import { sourceLabels, priorityLabels, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Search, Filter, Phone, Mail, Plus } from "lucide-react";

interface LeadsPageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    source?: LeadSource;
    priority?: Priority;
    search?: string;
    page?: string;
  }>;
}

const sourceOptions: { value: string; label: string }[] = [
  { value: "", label: "All Sources" },
  ...Object.entries(sourceLabels).map(([value, label]) => ({ value, label })),
];

const priorityOptions: { value: string; label: string }[] = [
  { value: "", label: "All Priorities" },
  ...Object.entries(priorityLabels).map(([value, label]) => ({ value, label })),
];

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const filters = {
    category: params.category,
    status: "lead_generated" as LeadStatus,
    city: params.city,
    source: params.source,
    priority: params.priority,
    search: params.search,
  };

  const [leadsResult, categoriesResult, tagsResult, citiesResult] = await Promise.all([
    getLeads(filters, { field: "createdAt", order: "desc" }, page, 20),
    getCategories(),
    getAllTags(),
    getCities(),
  ]);

  const leads: ILead[] = leadsResult.success && leadsResult.data ? leadsResult.data : [];
  const pagination = leadsResult.success && leadsResult.pagination ? leadsResult.pagination : null;
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];
  const tags = tagsResult.success && tagsResult.data ? tagsResult.data : [];
  const cities = citiesResult.success && citiesResult.data ? citiesResult.data : [];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((cat: { _id: string; name: string }) => ({
      value: cat._id,
      label: cat.name,
    })),
  ];

  const cityOptions = [
    { value: "", label: "All Cities" },
    ...cities.map((city: string) => ({ value: city, label: city })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Leads</h1>
          <p className="text-slate-500">
            {pagination?.total || 0} fresh leads waiting to be contacted
          </p>
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Search leads..."
                defaultValue={params.search}
                className="pl-10"
              />
            </div>
            <Select
              name="category"
              options={categoryOptions}
              defaultValue={params.category || ""}
            />
            <Select
              name="city"
              options={cityOptions}
              defaultValue={params.city || ""}
            />
            <Select
              name="source"
              options={sourceOptions}
              defaultValue={params.source || ""}
            />
            <Select
              name="priority"
              options={priorityOptions}
              defaultValue={params.priority || ""}
            />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-6">
              <Button type="submit" variant="primary">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Link href="/leads">
                <Button type="button" variant="outline">
                  Clear
                </Button>
              </Link>
            </div>
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
                   <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">
                     <td className="px-4 py-3">
                       <Link href={`/leads/${lead._id}`} className="block">
                         <p className="font-medium text-slate-900 hover:text-blue-600">{lead.name}</p>
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
                           <a href={`tel:${lead.phone}`} className="flex items-center text-sm text-slate-600 hover:text-blue-600">
                             <Phone className="mr-1 h-3 w-3" />
                             {lead.phone}
                           </a>
                         )}
                         {lead.email && (
                           <a href={`mailto:${lead.email}`} className="flex items-center text-sm text-slate-600 hover:text-blue-600">
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
                       {formatDate(lead.createdAt)}
                     </td>
                   </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                     <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No new leads found. <Link href="/leads/new" className="text-blue-600 hover:underline">Create your first lead</Link>
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
              <Link
                href={`/leads?${new URLSearchParams({
                  ...params,
                  page: String(pagination.page - 1),
                }).toString()}`}
              >
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={`/leads?${new URLSearchParams({
                  ...params,
                  page: String(pagination.page + 1),
                }).toString()}`}
              >
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
