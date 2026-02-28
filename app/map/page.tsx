import { Suspense } from "react";
import MapPageClient from "./MapPageClient";

export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>}>
      <MapPageClient />
    </Suspense>
  );
}
