"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface LeadFiltersProps {
  categoryOptions: { value: string; label: string }[];
  priorityOptions: { value: string; label: string }[];
  basePath: string;
}

export function LeadFilters({ categoryOptions, priorityOptions, basePath }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [priority, setPriority] = useState(searchParams.get("priority") || "");

  // Debounced search update
  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (priority) params.set("priority", priority);
    
    const queryString = params.toString();
    router.push(`${basePath}${queryString ? `?${queryString}` : ""}`);
  }, [search, category, priority, router, basePath]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [search, category, priority, updateFilters]);

  const handleClear = () => {
    setSearch("");
    setCategory("");
    setPriority("");
    router.push(basePath);
  };

  const hasFilters = search || category || priority;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select
        options={categoryOptions}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <Select
        options={priorityOptions}
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      />
      <div className="flex gap-2">
        {hasFilters && (
          <Button type="button" variant="outline" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
