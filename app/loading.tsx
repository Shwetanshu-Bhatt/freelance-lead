import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
      </div>
      <TableSkeleton rows={6} />
    </div>
  );
}
