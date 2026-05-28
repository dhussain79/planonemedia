import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getAll() {
  const [categories, suppliers, media, persons] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] }),
    prisma.supplier.findMany({
      orderBy: { companyName: "asc" },
      include: { primaryContact: true, contacts: true },
    }),
    prisma.media.findMany({
      orderBy: { title: "asc" },
      include: { supplier: true, categories: { include: { category: true } } },
    }),
    prisma.person.findMany(),
  ]);
  return { categories, suppliers, media, persons };
}

function Field({ label, value }: { label: string; value: unknown }) {
  const missing = value === null || value === undefined || value === "";
  return (
    <tr>
      <td style={{ padding: "4px 8px", fontWeight: 500, whiteSpace: "nowrap", color: "#555", fontSize: 13 }}>{label}</td>
      <td style={{ padding: "4px 8px", fontSize: 13, color: missing ? "#999" : "#000" }}>
        {missing ? <em style={{ color: "#ccc" }}>—</em> : String(value)}
      </td>
    </tr>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ background: "#f5f5f5", padding: "8px 12px", fontWeight: 600, fontSize: 14, borderBottom: "1px solid #ddd" }}>
        {title}
      </div>
      <div style={{ padding: 8 }}>{children}</div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const data = await getAll();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 4 }}>Data Review</h1>
      <p style={{ marginTop: 0, color: "#666", fontSize: 14 }}>
        All imported records — fields with <em style={{ color: "#ccc" }}>—</em> are empty/missing
      </p>

      <h2>Categories ({data.categories.length})</h2>
      {data.categories.map(c => (
        <Card key={c.id} title={`[${c.type}] ${c.name}`}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <Field label="ID" value={c.id} />
              <Field label="Name" value={c.name} />
              <Field label="Type" value={c.type} />
              <Field label="Parent ID" value={c.parentId} />
            </tbody>
          </table>
        </Card>
      ))}

      <h2>Suppliers ({data.suppliers.length})</h2>
      {data.suppliers.map(s => (
        <Card key={s.id} title={s.companyName}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <Field label="ID" value={s.id} />
              <Field label="Company Name" value={s.companyName} />
              <Field label="Trading Name" value={s.tradingName} />
              <Field label="CRN" value={s.crn} />
              <Field label="VAT Number" value={s.vatNumber} />
              <Field label="Email" value={s.email} />
              <Field label="Phone" value={s.phone} />
              <Field label="Fax" value={s.fax} />
              <Field label="Billing Address" value={s.billingAddress} />
              <Field label="Website" value={s.website} />
              <Field label="Logo" value={s.logo} />
              <Field label="Status" value={s.status} />
              <Field label="Primary Contact" value={s.primaryContact ? `${s.primaryContact.firstName} ${s.primaryContact.lastName}` : null} />
              <Field label="Contacts Count" value={s.contacts.length} />
              <Field label="Created" value={s.createdAt} />
              <Field label="Updated" value={s.updatedAt} />
            </tbody>
          </table>
        </Card>
      ))}

      <h2>Media ({data.media.length})</h2>
      {data.media.map(m => (
        <Card key={m.id} title={m.title}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <Field label="ID" value={m.id} />
              <Field label="Title" value={m.title} />
              <Field label="Slug" value={m.slug} />
              <Field label="Media Type" value={m.mediaType} />
              <Field label="Description" value={m.description ? m.description.slice(0, 200) + "…" : null} />
              <Field label="Summary" value={m.summary ? m.summary.slice(0, 200) + "…" : null} />
              <Field label="Region" value={m.region} />
              <Field label="Category" value={m.category} />
              <Field label="Profile" value={m.profile} />
              <Field label="Ratecard Files" value={m.ratecardFiles ? JSON.stringify(m.ratecardFiles) : null} />
              <Field label="Logo URL" value={m.logoUrl} />
              <Field label="Star Rating" value={m.starRating} />
              <Field label="Status" value={m.status} />
              <Field label="Supplier" value={m.supplier?.companyName} />
              <Field label="Categories" value={m.categories.map(c => `${c.category.name} (${c.category.type})`).join(", ")} />
              <Field label="Created" value={m.createdAt} />
              <Field label="Updated" value={m.updatedAt} />
            </tbody>
          </table>
        </Card>
      ))}

      <h2>Persons ({data.persons.length})</h2>
      {data.persons.map(p => (
        <Card key={p.id} title={`${p.firstName} ${p.lastName}`}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <Field label="ID" value={p.id} />
              <Field label="First Name" value={p.firstName} />
              <Field label="Last Name" value={p.lastName} />
              <Field label="Job Title" value={p.jobTitle} />
              <Field label="Email" value={p.email} />
              <Field label="Phone" value={p.phone} />
              <Field label="Mobile" value={p.mobile} />
              <Field label="Avatar" value={p.avatar} />
              <Field label="Is Default" value={p.isDefault ? "✓" : ""} />
              <Field label="Supplier ID" value={p.supplierId} />
            </tbody>
          </table>
        </Card>
      ))}
    </main>
  );
}
