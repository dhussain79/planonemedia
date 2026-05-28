import SiteHeader from "@/components/site-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="internal" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
