import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

function read(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sourceFiles(relativePath: string): string[] {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) return [];
  if (statSync(absolutePath).isFile()) return [absolutePath];
  return readdirSync(absolutePath).flatMap((entry) => sourceFiles(`${relativePath}/${entry}`));
}

function enumValues(schema: string, name: string) {
  const match = schema.match(new RegExp(`enum\\s+${name}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`Missing enum ${name}`);
  return match[1].trim().split(/\s+/).filter(Boolean);
}

function modelBody(schema: string, name: string) {
  const match = schema.match(new RegExp(`model\\s+${name}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!match) throw new Error(`Missing model ${name}`);
  return match[1];
}

describe("database provider contracts", () => {
  const sqlite = read("prisma/schema.prisma");
  const mysql = read("prisma/schema.mysql.prisma");

  it("keeps development on SQLite and production on MySQL", () => {
    expect(sqlite).toMatch(/datasource\s+db\s*\{[^}]*provider\s*=\s*"sqlite"/s);
    expect(mysql).toMatch(/datasource\s+db\s*\{[^}]*provider\s*=\s*"mysql"/s);
    expect(sqlite).toMatch(/url\s*=\s*env\("DATABASE_URL"\)/);
    expect(mysql).toMatch(/url\s*=\s*env\("DATABASE_URL"\)/);
  });

  it.each([
    "Role",
    "ConferenceStatus",
    "GeographicScope",
    "EventType",
    "DeliveryMode",
    "ContentStatus",
    "DateType",
    "SpeakerType",
    "OrganizerType",
    "MediaKind",
    "SubmissionState",
    "SubmissionStatus",
    "SubmissionKind",
    "ReviewAssignmentStatus",
    "ReviewRecommendation",
    "DecisionType",
  ])("keeps the %s enum identical across providers", (enumName) => {
    expect(enumValues(mysql, enumName)).toEqual(enumValues(sqlite, enumName));
  });

  it.each([
    "User",
    "Session",
    "Conference",
    "Category",
    "ConferenceCategory",
    "ConferenceSection",
    "ImportantDate",
    "ConferenceTrack",
    "Committee",
    "CommitteeMember",
    "Speaker",
    "Organizer",
    "RegistrationFee",
    "ConferenceProgrammeItem",
    "Sponsor",
    "MediaAsset",
    "Submission",
    "SubmissionAuthor",
    "SubmissionVersion",
    "ReviewAssignment",
    "Review",
    "SubmissionDecision",
    "ConferenceDocument",
    "ConferenceFaq",
    "ConferenceAnnouncement",
    "BlogPost",
    "Subscriber",
    "AuditEvent",
  ])("defines %s for both database providers", (modelName) => {
    expect(modelBody(sqlite, modelName)).toBeTruthy();
    expect(modelBody(mysql, modelName)).toBeTruthy();
  });

  it("enforces identities and duplicate-sensitive records", () => {
    expect(modelBody(sqlite, "Conference")).toMatch(/slug\s+String\s+@unique/);
    expect(modelBody(sqlite, "BlogPost")).toMatch(/slug\s+String\s+@unique/);
    expect(modelBody(sqlite, "Subscriber")).toMatch(/email\s+String\s+@unique/);
    expect(modelBody(sqlite, "Session")).toMatch(/tokenHash\s+String\s+@unique/);
    expect(modelBody(sqlite, "ConferenceSection")).toContain("@@unique([conferenceId, key])");
    expect(modelBody(sqlite, "ConferenceCategory")).toContain("@@id([conferenceId, categoryId])");
  });

  it("defaults conferences and posts to non-public states", () => {
    expect(modelBody(sqlite, "Conference")).toMatch(/status\s+ConferenceStatus\s+@default\(DRAFT\)/);
    expect(modelBody(sqlite, "BlogPost")).toMatch(/status\s+ContentStatus\s+@default\(DRAFT\)/);
    expect(modelBody(sqlite, "Conference")).toMatch(/publishedAt\s+DateTime\?/);
    expect(modelBody(sqlite, "BlogPost")).toMatch(/publishedAt\s+DateTime\?/);
  });

  it("models ordered dates, sections, speakers, and committee membership", () => {
    expect(modelBody(sqlite, "ImportantDate")).toContain("@@index([conferenceId, date])");
    expect(modelBody(sqlite, "ConferenceSection")).toMatch(/sortOrder\s+Int\s+@default\(0\)/);
    expect(modelBody(sqlite, "Speaker")).toMatch(/conference\s+Conference\s+@relation/);
    expect(modelBody(sqlite, "CommitteeMember")).toMatch(/committee\s+Committee\s+@relation/);
  });

  it("models versioned submissions, independent reviews, and durable decisions", () => {
    expect(modelBody(sqlite, "SubmissionVersion")).toContain("@@unique([submissionId, versionNumber])");
    expect(modelBody(sqlite, "ReviewAssignment")).toContain("@@unique([submissionId, reviewerId])");
    expect(modelBody(sqlite, "Review")).toMatch(/confidentialComments\s+String\?/);
    expect(modelBody(sqlite, "SubmissionDecision")).toMatch(/decidedBy\s+User\s+@relation/);
  });
});

describe("release configuration", () => {
  const packageJson = JSON.parse(read("package.json")) as {
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    engines: Record<string, string>;
  };
  const envExample = read(".env.example");

  it("pins the requested platform versions and Node runtime", () => {
    expect(packageJson.dependencies.next).toMatch(/^16\./);
    expect(packageJson.dependencies["@prisma/client"]).toMatch(/^6\.12\./);
    expect(packageJson.engines.node).toContain("22");
  });

  it("uses Webpack for development and production builds", () => {
    expect(packageJson.scripts.dev).toContain("--webpack");
    expect(packageJson.scripts.build).toContain("--webpack");
    expect(packageJson.scripts["build:production"]).toContain("--webpack");
  });

  it.each([
    "DATABASE_URL",
    "AUTH_SECRET",
    "NEXT_PUBLIC_APP_URL",
    "NODE_ENV",
    "STORAGE_DRIVER",
    "LOCAL_STORAGE_ROOT",
  ])("documents %s without embedding a production secret", (name) => {
    expect(envExample).toMatch(new RegExp(`^${name}=`, "m"));
  });

  it("keeps mail explicitly optional", () => {
    expect(envExample).toContain("Optional future mail transport");
    expect(envExample).toMatch(/^SMTP_PASSWORD=""$/m);
  });
});

describe("public identity guardrails", () => {
  const reviewedFiles = [
    resolve(root, "README.md"),
    resolve(root, ".env.example"),
    ...sourceFiles("src"),
    ...sourceFiles("scripts"),
    ...sourceFiles("prisma"),
  ].filter((path) => /\.(?:md|prisma|ts|tsx|css|example)$/i.test(path));
  const documentedSurface = reviewedFiles.map((path) => readFileSync(path, "utf8")).join("\n");

  it("contains the exact public brand and approved contacts", () => {
    expect(documentedSurface).toContain("ANVA Conferences");
    expect(documentedSurface).toContain("Academic & Scientific Conferences");
    expect(documentedSurface).toContain("contact@anvapublishing.com");
    expect(documentedSurface).toContain("editorial@anvapublishing.com");
    expect(documentedSurface).toContain("https://conferences.anvapublishing.com");
  });

  it("never uses the prohibited public corporate identity", () => {
    expect(documentedSurface).not.toMatch(/ANVA\s+Global\s+Pvt\.?\s+Ltd\.?/i);
  });

  it("does not configure a public-content seed", () => {
    const packageJson = JSON.parse(read("package.json")) as { prisma?: { seed?: string } };
    const seedFiles = sourceFiles("prisma").filter((path) => /(?:^|[\\/])seed\.[cm]?[jt]s$/i.test(path));
    expect(packageJson.prisma?.seed).toBeUndefined();
    expect(seedFiles).toEqual([]);
  });
});
