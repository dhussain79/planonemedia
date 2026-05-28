import Link from "next/link";

interface SiteHeaderProps {
  variant?: "public" | "internal";
}

export default function SiteHeader({ variant = "public" }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          PlanOneMedia
        </Link>
        {variant === "public" ? (
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#check-listing" className="hover:text-foreground transition-colors">
              Check Listing
            </Link>
            <Link href="/#waitlist" className="hover:text-foreground transition-colors">
              Join Waitlist
            </Link>
            <Link
              href="/signin"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </nav>
        ) : (
          <nav className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
