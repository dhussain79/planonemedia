import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanOneMedia — MENA Media Asset Trading Platform",
  description:
    "Trade, discover, and manage media assets across the MENA region. Join the leading marketplace connecting media suppliers with buyers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
