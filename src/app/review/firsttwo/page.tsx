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
    <html>
        <head>
          <title>First 2 Media - Raw Data Review</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>{`body { font-family: monospace; font-size: 13px; padding: 2rem; background: #fafafa; } pre { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; overflow-x: auto; white-space: pre-wrap; word-break: break-word; } h2 { margin-top: 2rem; } .gap { background: #fff3cd; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #ffc107; margin: 1rem 0; font-family: sans-serif; }`}</style>
        </head>
        <body>
          <h1>First 2 Media — Full Data Dump</h1>

          {media.map((m, i) => (
            <div key={m.id}>
              <h2>{i + 1}. {m.title}</h2>
              <pre>{JSON.stringify(m, null, 2)}</pre>
            </div>
          ))}

          <div className="gap">
            <strong>⚠ Missing from Media model (in legacy SQL but not captured):</strong>
            <ul style={{ margin: "4px 0" }}>
              <li>No <code>slug</code> generated</li>
            </ul>
          </div>

          <div className="gap">
            <strong>⚠ Missing from Supplier model (extracted from SQL but discarded):</strong>
            <ul style={{ margin: "4px 0" }}>
              <li><code>email</code> — read from <code>field_email</code> table but not mapped to output</li>
              <li><code>phone</code> — read from <code>field_phone</code> table but not mapped to output</li>
              <li><code>fax</code> — read from <code>field_fax</code> table but not mapped to output</li>
              <li><code>description</code> — extracted, stored in output JSON, but stripped by seed script</li>
              <li><code>tradingName</code>, <code>crn</code>, <code>vatNumber</code>, <code>billingAddress</code>, <code>website</code> — all hardcoded null (not in legacy?)</li>
            </ul>
          </div>

          <div className="gap">
            <strong>⚠ Person model — contact data is completely empty:</strong>
            <ul style={{ margin: "4px 0" }}>
              <li>PlanOne Media placeholder has no <code>email</code>, <code>phone</code>, <code>mobile</code></li>
              <li>Real contacts (from legacy) need to be extracted and linked</li>
            </ul>
          </div>
        </body>
      </html>
    );
}
