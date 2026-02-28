import { getLeads } from "@/app/actions/leads";
import { getCategories } from "@/app/actions/categories";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { InlineStatusUpdate } from "@/components/InlineStatusUpdate";
import { InlineNotes } from "@/components/InlineNotes";
import { InlinePriorityUpdate } from "@/components/InlinePriorityUpdate";
import { LeadFilters } from "@/components/LeadFilters";
import { CopyButton } from "@/components/CopyButton";
import { ILead, Priority } from "@/lib/types";
import { formatDate, priorityLabels } from "@/lib/utils";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

interface ToSendPageProps {
  searchParams: Promise<{
    category?: string;
    priority?: Priority;
    search?: string;
    page?: string;
  }>;
}

export default async function ToSendPage({ searchParams }: ToSendPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const [leadsResult, categoriesResult] = await Promise.all([
    getLeads(
      { status: "to_send", isDeleted: false, category: params.category, priority: params.priority, search: params.search },
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

  const priorityOptions: { value: string; label: string }[] = [
    { value: "", label: "All Priorities" },
    ...Object.entries(priorityLabels).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">To Send</h1>
          <p className="text-slate-500">
            {pagination?.total || 0} leads waiting for proposal to be sent
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <LeadFilters
            categoryOptions={categoryOptions}
            priorityOptions={priorityOptions}
            basePath="/to-send"
          />
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Maps</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Notes</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/leads/${lead._id}`} className="block flex-1">
                          <p className="font-semibold text-slate-900 hover:text-blue-600">{lead.name}</p>
                          {lead.contactPerson && (
                            <p className="text-sm text-slate-500">{lead.contactPerson}</p>
                          )}
                        </Link>
                        <CopyButton text={lead.name} />
                      </div>
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
                          <div className="flex items-center gap-1">
                            <a href={`tel:${lead.phone}`} className="flex items-center text-sm text-blue-600 hover:underline">
                              <Phone className="mr-1 h-3 w-3" />
                              {lead.phone}
                            </a>
                            <CopyButton text={lead.phone} />
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <a href={`mailto:${lead.email}`} className="flex items-center text-sm text-blue-600 hover:underline">
                              <Mail className="mr-1 h-3 w-3" />
                              {lead.email}
                            </a>
                            <CopyButton text={lead.email} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.googleMapsUrl ? (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:underline"
                        >
                          <MapPin className="mr-1 h-4 w-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
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
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No leads waiting to send proposal.
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
                href={`/to-send?${new URLSearchParams({
                  ...params,
                  page: String(pagination.page - 1),
                }).toString()}`}
              >
                <button className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Previous</button>
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={`/to-send?${new URLSearchParams({
                  ...params,
                  page: String(pagination.page + 1),
                }).toString()}`}
              >
                <button className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Next</button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
