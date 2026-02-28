import { notFound } from "next/navigation";
import Link from "next/link";
import { getLeadById } from "@/app/actions/leads";
import { getCategories } from "@/app/actions/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StarRating } from "@/components/StarRating";
import { QuickStatusUpdate } from "@/components/QuickStatusUpdate";
import { EditLeadModal } from "@/components/EditLeadModal";
import { formatDate, sourceLabels, statusLabels } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const [leadResult, categoriesResult] = await Promise.all([
    getLeadById(id),
    getCategories(),
  ]);

  if (!leadResult.success || !leadResult.data) {
    notFound();
  }

  const lead = leadResult.data;
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-gray-500">
              {typeof lead.category === "object" ? lead.category.name : "Unknown Category"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <EditLeadModal lead={lead} categories={categories} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={lead.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <div className="mt-1">
                    <PriorityBadge priority={lead.priority} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <div className="mt-1">
                    <StarRating rating={lead.rating} reviewCount={lead.reviewCount} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Source</label>
                  <p className="mt-1 text-gray-900">{sourceLabels[lead.source]}</p>
                </div>
              </div>

              {lead.contactPerson && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="mt-1 text-gray-900">{lead.contactPerson}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {lead.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </label>
                    <a
                      href={`tel:${lead.phone}`}
                      className="mt-1 text-blue-600 hover:underline block"
                    >
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <a
                      href={`mailto:${lead.email}`}
                      className="mt-1 text-blue-600 hover:underline block"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}
              </div>

              {(lead.address.street || lead.address.city) && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </label>
                  <div className="mt-1 text-gray-900">
                    {lead.address.street && <p>{lead.address.street}</p>}
                    {(lead.address.city || lead.address.state || lead.address.postalCode) && (
                      <p>
                        {lead.address.city}
                        {lead.address.city && lead.address.state && ", "}
                        {lead.address.state} {lead.address.postalCode}
                      </p>
                    )}
                    {lead.address.country && <p>{lead.address.country}</p>}
                  </div>
                  {lead.googleMapsUrl && (
                    <a
                      href={lead.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Google Maps
                    </a>
                  )}
                </div>
              )}

              {lead.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}

              {lead.tags && lead.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {lead.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickStatusUpdate leadId={lead._id} currentStatus={lead.status} />

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-500">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-500">{formatDate(lead.updatedAt)}</p>
                </div>
              </div>
              {lead.contactedAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contacted</p>
                    <p className="text-sm text-gray-500">{formatDate(lead.contactedAt)}</p>
                  </div>
                </div>
              )}
              {lead.lastActivityAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Activity</p>
                    <p className="text-sm text-gray-500">{formatDate(lead.lastActivityAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {lead.address.latitude && lead.address.longitude && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Link href={`/map?lead=${lead._id}`}>
                    <Button variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
