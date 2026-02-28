"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getLeads } from "@/app/actions/leads";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ILead } from "@/lib/types";
import { MapPin, ExternalLink } from "lucide-react";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

interface LeafletType {
  icon: (options: { iconUrl: string; iconSize: [number, number]; iconAnchor: [number, number]; popupAnchor: [number, number] }) => unknown;
}

let L: LeafletType | null = null;

if (typeof window !== "undefined") {
  import("leaflet").then((leaflet) => {
    L = leaflet;
  });
}

export default function MapPageClient() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("lead");
  
  const [leads, setLeads] = useState<ILead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    loadLeads();
    // Wait for leaflet to be ready
    const checkLeaflet = setInterval(() => {
      if (L) {
        setLeafletReady(true);
        clearInterval(checkLeaflet);
      }
    }, 100);
    return () => clearInterval(checkLeaflet);
  }, []);

  useEffect(() => {
    if (leadId && leads.length > 0) {
      const lead = leads.find((l) => l._id === leadId);
      if (lead) {
        setSelectedLead(lead);
      }
    }
  }, [leadId, leads]);

  const loadLeads = async () => {
    const result = await getLeads({ isDeleted: false }, { field: "createdAt", order: "desc" }, 1, 500);
    if (result.success && result.data) {
      const leadsWithLocation = result.data.filter(
        (lead: ILead) => lead.address?.latitude && lead.address?.longitude
      );
      setLeads(leadsWithLocation);
    }
    setIsLoading(false);
  };

  const defaultCenter: [number, number] = useMemo(() => {
    if (leads.length > 0 && leads[0].address.latitude && leads[0].address.longitude) {
      return [leads[0].address.latitude, leads[0].address.longitude];
    }
    return [20.5937, 78.9629]; // Center of India
  }, [leads]);

  const mapCenter: [number, number] = selectedLead?.address.latitude && selectedLead?.address.longitude
    ? [selectedLead.address.latitude, selectedLead.address.longitude]
    : defaultCenter;

  if (isLoading || !leafletReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lead Map</h1>
        <p className="text-gray-500">
          {leads.length} leads with location data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 h-[600px]">
        {/* Sidebar */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardContent className="p-0 overflow-y-auto h-full">
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <button
                  key={lead._id}
                  onClick={() => setSelectedLead(lead)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedLead?._id === lead._id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{lead.name}</p>
                      <p className="text-sm text-gray-500">
                        {typeof lead.category === "object"
                          ? lead.category.name
                          : "Unknown"}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={lead.status} />
                      </div>
                      {lead.address.city && (
                        <p className="text-xs text-gray-400 mt-1">
                          {lead.address.city}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {leads.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No leads with location data</p>
                  <p className="text-sm mt-1">
                    Add latitude and longitude to leads to see them on the map
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardContent className="p-0 h-full">
            {leads.length > 0 ? (
              <MapContainer
                center={mapCenter}
                zoom={selectedLead ? 15 : 5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {leads.map((lead) => (
                  <Marker
                    key={lead._id}
                    position={[lead.address.latitude!, lead.address.longitude!]}
                    eventHandlers={{
                      click: () => setSelectedLead(lead),
                    }}
                  >
                    <Popup>
                      <div className="space-y-2 min-w-[200px]">
                        <h3 className="font-semibold">{lead.name}</h3>
                        <p className="text-sm text-gray-600">
                          {typeof lead.category === "object"
                            ? lead.category.name
                            : "Unknown"}
                        </p>
                        <StatusBadge status={lead.status} />
                        {lead.address.street && (
                          <p className="text-sm text-gray-600">
                            {lead.address.street}
                          </p>
                        )}
                        <Link href={`/leads/${lead._id}`}>
                          <Button size="sm" className="w-full mt-2">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Lead
                          </Button>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900">No leads to display</h3>
                  <p className="text-gray-500 mt-1">
                    Add location data to your leads to see them here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
