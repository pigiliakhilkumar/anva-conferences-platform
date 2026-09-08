export const APP_NAME = "ANVA Conferences";
export const APP_TAGLINE = "Academic & Scientific Conferences";
export const ORGANIZATION_LINE = "A scholarly events initiative of ANVA Publishing";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://conferences.anvapublishing.com";
export const CONTACT_EMAIL = "contact@anvapublishing.com";
export const EDITORIAL_EMAIL = "editorial@anvapublishing.com";

export const SECTION_DEFAULTS = [
  ["about", "About"], ["key-information", "Key Information"], ["important-dates", "Important Dates"],
  ["tracks", "Themes & Tracks"], ["call-for-papers", "Call for Papers"],
  ["submission-guidelines", "Submission Guidelines"], ["registration", "Registration"],
  ["speakers", "Speakers"], ["committees", "Committees"], ["programme", "Programme"],
  ["venue", "Venue"], ["travel", "Travel"], ["accommodation", "Accommodation"],
  ["sponsors", "Sponsors"], ["downloads", "Downloads"], ["announcements", "Announcements"],
  ["faq", "FAQ"], ["contact", "Contact"]
] as const;

export const DEFAULT_CATEGORIES = [
  "Biological Sciences", "Medical & Health Sciences", "Biotechnology", "Artificial Intelligence & Computing",
  "Engineering & Technology", "Chemical Sciences", "Physical Sciences", "Materials Science",
  "Earth & Environmental Sciences", "Sustainability", "Energy", "Agriculture",
  "Mathematics & Statistics", "Interdisciplinary Research"
] as const;
