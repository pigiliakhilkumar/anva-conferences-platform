"use client";
import { useActionState } from "react";
import type { Conference } from "@prisma/client";
import type { ActionState } from "@/lib/validation";

type Props = { conference?: Conference; action: (state: ActionState, data: FormData) => Promise<ActionState> };
const initial: ActionState = { ok: false, message: "" };
const input = (name: keyof Conference | string, label: string, value?: unknown, type = "text", required = false) => (
  <label>{label}<input name={name} type={type} defaultValue={value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "")} required={required} /></label>
);
const area = (name: keyof Conference, label: string, value?: unknown) => <label className="wide">{label}<textarea name={name} defaultValue={String(value ?? "")} rows={5} /></label>;

export function ConferenceForm({ conference: c, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  return <form action={formAction} className="builder-form">
    {state.message && <p className={state.ok ? "notice success" : "notice error"} role="status">{state.message}</p>}
    <fieldset><legend>A — Basic information</legend>
      {input("title", "Full conference title", c?.title, "text", true)} {input("acronym", "Acronym", c?.acronym)} {input("slug", "URL slug", c?.slug, "text", true)}
      <label>Geographic classification<select name="scope" defaultValue={c?.scope || "INTERNATIONAL"}><option>INTERNATIONAL</option><option>NATIONAL</option></select></label>
      <label>Event type<select name="eventType" defaultValue={c?.eventType || "CONFERENCE"}>{["CONFERENCE","CONGRESS","SYMPOSIUM","SUMMIT","WORKSHOP","SEMINAR","COLLOQUIUM","OTHER"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Delivery mode<select name="deliveryMode" defaultValue={c?.deliveryMode || "PHYSICAL"}>{["PHYSICAL","VIRTUAL","HYBRID"].map(x=><option key={x}>{x}</option>)}</select></label>
      {input("theme", "Theme or tagline", c?.theme)} {area("shortDescription", "Short description", c?.shortDescription)} {area("about", "Detailed about content", c?.about)}
    </fieldset>
    <fieldset><legend>C — Dates</legend>{input("startDate", "Conference starts", c?.startDate, "date", true)}{input("endDate", "Conference ends", c?.endDate, "date", true)}{input("timezone", "IANA timezone", c?.timezone || "UTC", "text", true)}</fieldset>
    <fieldset><legend>D — Venue and access</legend>{input("venueName", "Venue name", c?.venueName)}{input("city", "City", c?.city)}{input("region", "State / region", c?.region)}{input("country", "Country", c?.country)}{input("mapUrl", "Map URL", c?.mapUrl, "url")}{area("venueDescription", "Venue information", c?.venueDescription)}{area("virtualInfo", "Virtual event information", c?.virtualInfo)}{area("travelInfo", "Travel information", c?.travelInfo)}{area("accommodationInfo", "Accommodation information", c?.accommodationInfo)}</fieldset>
    <fieldset><legend>H–I — Submission and registration content</legend>{area("callForPapers", "Call for papers", c?.callForPapers)}{area("submissionGuidelines", "Submission guidelines", c?.submissionGuidelines)}
      <label>Submission state<select name="submissionState" defaultValue={c?.submissionState || "UPCOMING"}><option>UPCOMING</option><option>OPEN</option><option>CLOSED</option></select></label>{input("submissionTypes", "Additional submission types", c?.submissionTypes)}
      <label><span><input type="checkbox" name="abstractAllowed" defaultChecked={c?.abstractAllowed}/> Abstract allowed</span></label><label><span><input type="checkbox" name="fullPaperAllowed" defaultChecked={c?.fullPaperAllowed}/> Full paper allowed</span></label><label><span><input type="checkbox" name="posterAllowed" defaultChecked={c?.posterAllowed}/> Poster allowed</span></label><label><span><input type="checkbox" name="workshopProposalAllowed" defaultChecked={c?.workshopProposalAllowed}/> Workshop proposal allowed</span></label>{area("registrationInfo", "Registration information", c?.registrationInfo)}
    </fieldset>
    <fieldset><legend>N — Contact</legend>{input("contactName", "Contact name", c?.contactName)}{input("contactRole", "Contact role", c?.contactRole)}{input("contactEmail", "Email", c?.contactEmail, "email")}{input("contactPhone", "Phone (only if supplied)", c?.contactPhone)}{area("contactText", "Additional contact text", c?.contactText)}</fieldset>
    <fieldset><legend>O — SEO & social</legend>{input("seoTitle", "SEO title", c?.seoTitle)}{area("metaDescription", "Meta description", c?.metaDescription)}</fieldset>
    <button className="button primary" disabled={pending}>{pending ? "Saving…" : c ? "Save changes" : "Create draft conference"}</button>
  </form>;
}
