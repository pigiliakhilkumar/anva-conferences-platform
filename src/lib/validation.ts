import { z } from "zod";
import { slugify } from "./text";

const optionalText = z.string().trim().max(10000).optional().or(z.literal(""));
export const conferenceSchema = z.object({
  title: z.string().trim().min(5).max(250),
  acronym: z.string().trim().max(30).optional().or(z.literal("")),
  slug: z.string().trim().min(3).max(100).transform(slugify).refine(Boolean, "Enter a valid slug"),
  shortDescription: z.string().trim().min(30).max(500),
  about: optionalText,
  theme: z.string().trim().max(250).optional().or(z.literal("")),
  scope: z.enum(["INTERNATIONAL", "NATIONAL"]),
  eventType: z.enum(["CONFERENCE", "CONGRESS", "SYMPOSIUM", "SUMMIT", "WORKSHOP", "SEMINAR", "COLLOQUIUM", "OTHER"]),
  deliveryMode: z.enum(["PHYSICAL", "VIRTUAL", "HYBRID"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  timezone: z.string().trim().min(1).max(100),
  venueName: z.string().trim().max(250).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  region: z.string().trim().max(100).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  venueDescription: optionalText, mapUrl: z.string().url().optional().or(z.literal("")), virtualInfo: optionalText,
  travelInfo: optionalText, accommodationInfo: optionalText, callForPapers: optionalText,
  submissionGuidelines: optionalText, registrationInfo: optionalText,
  abstractAllowed: z.preprocess(v => v === "on" || v === true, z.boolean()),
  fullPaperAllowed: z.preprocess(v => v === "on" || v === true, z.boolean()),
  posterAllowed: z.preprocess(v => v === "on" || v === true, z.boolean()),
  workshopProposalAllowed: z.preprocess(v => v === "on" || v === true, z.boolean()),
  submissionTypes: z.string().trim().max(500).optional().or(z.literal("")),
  submissionState: z.enum(["OPEN", "CLOSED", "UPCOMING"]).default("UPCOMING"),
  contactName: z.string().trim().max(150).optional().or(z.literal("")),
  contactRole: z.string().trim().max(150).optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().max(50).optional().or(z.literal("")), contactText: optionalText,
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(170).optional().or(z.literal(""))
}).refine((x) => x.endDate >= x.startDate, { path: ["endDate"], message: "End date must be on or after the start date" })
  .refine((x) => x.deliveryMode === "VIRTUAL" || Boolean(x.city && x.country), { path: ["city"], message: "Physical and hybrid events require a city and country" });

export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(10).max(200) });
export const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(200).regex(/[a-z]/, "Include a lowercase letter").regex(/[A-Z]/, "Include an uppercase letter").regex(/[0-9]/, "Include a number").regex(/[^A-Za-z0-9]/, "Include a symbol"),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export const profileSchema = z.object({ name: z.string().trim().min(2).max(120), affiliation: z.string().trim().max(250).optional().or(z.literal("")), department: z.string().trim().max(200).optional().or(z.literal("")), designation: z.string().trim().max(160).optional().or(z.literal("")), country: z.string().trim().max(100).optional().or(z.literal("")), orcid: z.string().trim().max(40).regex(/^$|^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i, "Enter a valid ORCID iD").optional().or(z.literal("")), phone: z.string().trim().max(50).optional().or(z.literal("")), addressLine1: z.string().trim().max(250).optional().or(z.literal("")), addressLine2: z.string().trim().max(250).optional().or(z.literal("")), city: z.string().trim().max(100).optional().or(z.literal("")), region: z.string().trim().max(100).optional().or(z.literal("")), postalCode: z.string().trim().max(30).optional().or(z.literal("")), reviewerExpertise: z.string().trim().max(1000).optional().or(z.literal("")) });
export const submissionSchema = z.object({
  conferenceId: z.string().cuid(), title: z.string().trim().min(5).max(250),
  abstractText: z.string().trim().min(50).max(10000), keywords: z.string().trim().max(500).optional().or(z.literal("")),
  kind: z.enum(["ABSTRACT", "FULL_PAPER", "POSTER", "WORKSHOP_PROPOSAL", "OTHER"]), trackId: z.string().cuid().optional().or(z.literal("")),
});
export const authorSchema = z.object({ name: z.string().trim().min(2).max(150), givenName: z.string().trim().max(100).optional().or(z.literal("")), familyName: z.string().trim().max(100).optional().or(z.literal("")), email: z.string().trim().toLowerCase().email().max(254), affiliation: z.string().trim().max(250).optional().or(z.literal("")), country: z.string().trim().max(100).optional().or(z.literal("")), orcid: z.string().trim().max(40).optional().or(z.literal("")), corresponding: z.preprocess(v => v === "on" || v === true, z.boolean()) });
export const reviewSchema = z.object({ recommendation: z.enum(["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"]), score: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")), authorComments: z.string().trim().min(20).max(10000), confidentialComments: z.string().trim().max(10000).optional().or(z.literal("")) });
export const decisionSchema = z.object({ type: z.enum(["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REVISION_REQUIRED", "REJECT"]), comments: z.string().trim().min(10).max(10000) });
export const subscriberSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });
export const importantDateSchema = z.object({
  type: z.enum(["ABSTRACT_OPENS", "ABSTRACT_DEADLINE", "FULL_PAPER_DEADLINE", "NOTIFICATION", "REVISION_DEADLINE", "EARLY_BIRD_DEADLINE", "REGULAR_REGISTRATION_DEADLINE", "CONFERENCE_START", "CONFERENCE_END", "CUSTOM"]),
  customLabel: z.string().trim().max(120).optional().or(z.literal("")), date: z.coerce.date(), notes: z.string().trim().max(500).optional().or(z.literal(""))
}).refine((x) => x.type !== "CUSTOM" || Boolean(x.customLabel), { path: ["customLabel"], message: "Custom dates require a label" });

export type ActionState = { ok: boolean; message: string; errors?: Record<string, string[]> };
