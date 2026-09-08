import { ConferenceStatus, Prisma } from "@prisma/client";
import { db } from "./db";

export const PUBLIC_STATUSES: ConferenceStatus[] = ["PUBLISHED", "ONGOING", "COMPLETED"];

export function publicConferenceWhere(): Prisma.ConferenceWhereInput {
  return { status: { in: PUBLIC_STATUSES }, publishedAt: { not: null } };
}

export function canTransition(from: ConferenceStatus, to: ConferenceStatus) {
  const allowed: Record<ConferenceStatus, ConferenceStatus[]> = {
    DRAFT: ["PUBLISHED", "ARCHIVED", "CANCELLED"],
    PUBLISHED: ["DRAFT", "ONGOING", "COMPLETED", "ARCHIVED", "CANCELLED"],
    ONGOING: ["COMPLETED", "ARCHIVED", "CANCELLED"],
    COMPLETED: ["ARCHIVED"],
    ARCHIVED: ["DRAFT"],
    CANCELLED: ["DRAFT", "ARCHIVED"]
  };
  return from === to || allowed[from].includes(to);
}

export async function getPublicConference(slug: string) {
  return db.conference.findFirst({ where: { slug, ...publicConferenceWhere() }, include: {
    categories: { include: { category: true } }, sections: { orderBy: { sortOrder: "asc" } },
    importantDates: { orderBy: { date: "asc" } }, tracks: { orderBy: { sortOrder: "asc" } },
    committees: { orderBy: { sortOrder: "asc" }, include: { members: { orderBy: { sortOrder: "asc" }, include: { photo: true } } } },
    speakers: { orderBy: { sortOrder: "asc" }, include: { photo: true } }, organizers: { orderBy: { sortOrder: "asc" }, include: { logo: true } },
    fees: { orderBy: { sortOrder: "asc" } }, programmeItems: { orderBy: [{ day: "asc" }, { sortOrder: "asc" }] },
    sponsors: { orderBy: { sortOrder: "asc" }, include: { logo: true } }, documents: { orderBy: { sortOrder: "asc" }, include: { media: true } },
    faqs: { orderBy: { sortOrder: "asc" } }, announcements: { where: { publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" } }, logo: true, banner: true
  } });
}
