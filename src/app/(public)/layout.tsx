import SiteHeader from "@/components/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="public" />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PlanOneMedia. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
