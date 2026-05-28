import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FirstTwoPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  const media = await prisma.media.findMany({
    take: 2,
    orderBy: { title: "asc" },
    include: {
      supplier: true,
      categories: { include: { category: true } },
    },
  });

  return (
    <div style={{ fontFamily: "monospace", fontSize: 13, padding: "2rem", background: "#fafafa" }}>
      <h1>First 2 Media — Full Data Dump</h1>

      {media.map((m, i) => (
        <div key={m.id}>
          <h2 style={{ marginTop: "2rem" }}>{i + 1}. {m.title}</h2>
          <pre style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "1.5rem", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(m, null, 2)}</pre>
        </div>
      ))}

      <div style={{ background: "#fff3cd", padding: "0.5rem 1rem", borderRadius: 6, border: "1px solid #ffc107", margin: "1rem 0", fontFamily: "sans-serif" }}>
        <strong>⚠ Missing from Media model (in legacy SQL but not captured):</strong>
        <ul style={{ margin: "4px 0" }}>
          <li>No <code>slug</code> generated</li>
        </ul>
      </div>

      <div style={{ background: "#fff3cd", padding: "0.5rem 1rem", borderRadius: 6, border: "1px solid #ffc107", margin: "1rem 0", fontFamily: "sans-serif" }}>
        <strong>⚠ Missing from Supplier model (extracted from SQL but discarded):</strong>
        <ul style={{ margin: "4px 0" }}>
          <li><code>email</code> — read from <code>field_email</code> table but not mapped to output</li>
          <li><code>phone</code> — read from <code>field_phone</code> table but not mapped to output</li>
          <li><code>fax</code> — read from <code>field_fax</code> table but not mapped to output</li>
          <li><code>description</code> — extracted, stored in output JSON, but stripped by seed script</li>
          <li><code>tradingName</code>, <code>crn</code>, <code>vatNumber</code>, <code>billingAddress</code>, <code>website</code> — all hardcoded null (not in legacy?)</li>
        </ul>
      </div>

      <div style={{ background: "#fff3cd", padding: "0.5rem 1rem", borderRadius: 6, border: "1px solid #ffc107", margin: "1rem 0", fontFamily: "sans-serif" }}>
        <strong>⚠ Person model — contact data is completely empty:</strong>
        <ul style={{ margin: "4px 0" }}>
          <li>PlanOne Media placeholder has no <code>email</code>, <code>phone</code>, <code>mobile</code></li>
          <li>Real contacts (from legacy) need to be extracted and linked</li>
        </ul>
      </div>
    </div>
  );
}
