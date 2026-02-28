import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-out hover:scale-105",
        {
          "bg-blue-100 text-blue-700 border border-blue-200": variant === "default",
          "bg-slate-100 text-slate-700 border border-slate-200": variant === "secondary",
          "bg-white text-slate-700 border border-slate-300": variant === "outline",
          "bg-green-100 text-green-700 border border-green-200": variant === "success",
          "bg-amber-100 text-amber-700 border border-amber-200": variant === "warning",
          "bg-red-100 text-red-700 border border-red-200": variant === "danger",
          "bg-cyan-100 text-cyan-700 border border-cyan-200": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
