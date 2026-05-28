import { ArrowRight, BarChart3, Globe2, ShieldCheck } from "lucide-react";
import WaitlistForm from "@/components/waitlist-form";
import CheckListing from "@/components/check-listing";
import SiteHeader from "@/components/site-header";

const features = [
  {
    icon: Globe2,
    title: "MENA-Focused Marketplace",
    description:
      "Connect with media asset suppliers and buyers across the Middle East and North Africa region.",
  },
  {
    icon: BarChart3,
    title: "Asset Discovery & Analytics",
    description:
      "Browse, compare, and analyze media assets with rich metadata and performance insights.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Suppliers",
    description:
      "Every supplier is vetted and verified. Trade with confidence on our curated platform.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border bg-white px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Now accepting early access applications
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Trade Media Assets Across
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                the MENA Region
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The first dedicated marketplace for media asset trading in the
              Middle East and North Africa. Discover, list, and trade television
              programs, films, and digital content with verified industry
              partners.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
              >
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border bg-white px-8 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-white py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Why PlanOneMedia?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for media professionals who need a trusted platform for
              asset trading in the MENA market.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Check Listing */}
      <CheckListing />

      {/* Waitlist */}
      <section id="waitlist" className="bg-gradient-to-b from-blue-50 to-white py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Get Early Access
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join the waitlist and be among the first to access the platform
              when we launch.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">PlanOneMedia</span>
            <p>&copy; {new Date().getFullYear()} PlanOneMedia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
