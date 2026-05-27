import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlanOneMedia",
  description: "Media asset trading and discovery portal for the MENA market",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
