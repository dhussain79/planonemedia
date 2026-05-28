"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, ArrowRight, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SupplierResult {
  id: string;
  companyName: string;
  status: string;
}

export default function CheckListing() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SupplierResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(
    async (q: string) => {
      setQuery(q);
      setSearched(false);
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/supplier/claim?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        setResults(data.suppliers ?? []);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    },
    [],
  );

  return (
    <section id="check-listing" className="border-t bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <div className="mb-4 inline-flex items-center rounded-full border bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            Already in our database?
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Check Your Listing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Search for your company name to see if your legacy media listing
            exists. If found, you can claim it and take control.
          </p>
        </div>

        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-blue-600" />
              Search Your Company
            </CardTitle>
            <CardDescription>
              Enter your company name to check if you&apos;re already listed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="e.g. Al Arabiya, MBC Group..."
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
                          <span
                            className={
                              r.status === "ACTIVE"
                                ? "text-green-600"
                                : r.status === "PENDING_VERIFICATION"
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                            }
                          >
                            {r.status.replace(/_/g, " ")}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push("/supplier/claim")}
                    >
                      Claim Now
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
                    No results for &ldquo;{query}&rdquo;.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your company isn&apos;t in our database yet.{" "}
                    <a
                      href="/signup"
                      className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
                    >
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
