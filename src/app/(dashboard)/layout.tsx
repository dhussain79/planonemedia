"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import SiteHeader from "@/components/site-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader variant="internal" />
        <main className="flex-1">{children}</main>
      </div>
    </QueryClientProvider>
  );
}
