import { requireAccount } from "@/lib/auth";
import { db } from "@/lib/db";
import { createRegistrationAction } from "@/app/actions/registrations";
import { ActionForm } from "@/components/workspace/action-form";

export default async function NewRegistrationPage() {
  const user = await requireAccount();
  const conferences = await db.conference.findMany({ where: { status: "PUBLISHED" }, include: { registrationCategories: { where: { active: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { startDate: "asc" } });
  return <><header className="admin-header"><div><p className="eyebrow">Conference registration</p><h1>Register to attend</h1></div></header><section className="admin-panel"><ActionForm action={createRegistrationAction} submitLabel="Continue" className="stack-form"><label>Conference<select name="conferenceId" required defaultValue=""><option value="" disabled>Select a conference</option>{conferences.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>Registration category<select name="categoryId" required defaultValue=""><option value="" disabled>Select a category</option>{conferences.flatMap(c => c.registrationCategories.map(cat => <option key={cat.id} value={cat.id}>{c.title} — {cat.name}</option>))}</select></label><label>Discount code (optional)<input name="discountCode" autoComplete="off" /></label><label>Billing name<input name="billingName" defaultValue={user.name ?? ""} /></label><label>Billing address<textarea name="billingAddress" rows={3} /></label><label>Tax ID (optional)<input name="taxId" /></label><p className="muted">Fees are calculated securely from the conference price configuration. Payment card details are never collected here.</p></ActionForm></section></>;
}
