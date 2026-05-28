"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/site-header";

interface SupplierResult {
  id: string;
  companyName: string;
  status: string;
}

export default function ClaimPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SupplierResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    setSearched(false);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/supplier/claim?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.suppliers ?? []);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  const claim = async (supplierId: string) => {
    setClaiming(supplierId);
    setMessage("");
    try {
      const res = await fetch("/api/supplier/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId }),
      });

      if (res.status === 401) {
        router.push("/signin?redirect=/supplier/claim");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMessage("Claim submitted for review! We'll notify you once approved.");
        setResults([]);
        setQuery("");
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } finally {
      setClaiming(null);
    }
  };

  return (
    <>
      <SiteHeader variant="internal" />
      <main className="container mx-auto max-w-xl px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Claim Your Company</h1>
          <p className="mt-2 text-muted-foreground">
            Search for your company name to claim your supplier profile
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-blue-600" />
              Search Your Company
            </CardTitle>
            <CardDescription>
              Enter your company name to see if it&apos;s already in our database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search your company name..."
                value={query}
                onChange={(e) => search(e.target.value)}
                className="pr-20"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {results.length > 0 && (
              <div className="space-y-3 pt-2">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{r.companyName}</p>
                        <p className="text-xs text-muted-foreground">
                          Status:{" "}
                          <span className={
                            r.status === "ACTIVE" ? "text-green-600 font-medium" :
                            r.status === "PENDING_VERIFICATION" ? "text-amber-600 font-medium" :
                            "text-muted-foreground"
                          }>
                            {r.status.replace(/_/g, " ")}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => claim(r.id)}
                      disabled={claiming === r.id}
                    >
                      {claiming === r.id ? "Claiming..." : "Claim"}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searched && query.length >= 2 && results.length === 0 && (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No companies found matching &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your company isn&apos;t in our database yet.{" "}
                    <a href="/signup" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
                      Register now
                    </a>{" "}
                    to add it.
                  </p>
                </CardContent>
              </Card>
            )}

            {!searched && query.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center">
                <Building2 className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Type your company name above to search
                </p>
              </div>
            )}

            {message && (
              <div className={`rounded-lg p-4 text-sm ${
                message.includes("submitted") ? "bg-green-50 text-green-700 border border-green-200" :
                "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-blue-600 underline underline-offset-2 hover:text-blue-700">
            ← Back to Home
          </a>
        </div>
      </main>
    </>
  );
}
