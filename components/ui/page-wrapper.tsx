"use client";

import { ReactNode, useEffect, useState } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={
        mounted
          ? "animate-in fade-in slide-in-from-bottom-2 duration-500"
          : "opacity-0"
      }
    >
      {children}
    </div>
  );
}
