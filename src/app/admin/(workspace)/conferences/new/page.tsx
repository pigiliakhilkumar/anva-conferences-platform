import { createConferenceAction } from "@/app/actions/conferences";
import { ConferenceForm } from "@/components/admin/conference-form";
export default function NewConference() { return <><header className="admin-header"><div><p className="eyebrow">Conference builder</p><h1>Create Conference</h1><p>Start with core information. The conference remains a private draft.</p></div></header><ConferenceForm action={createConferenceAction} /></>; }
