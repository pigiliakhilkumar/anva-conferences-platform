import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MediaKind } from "@prisma/client";

const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;

type AllowedMedia = {
  extension: string;
  kind: MediaKind;
  maxBytes: number;
  signature: (bytes: Uint8Array) => boolean;
};

const startsWith = (bytes: Uint8Array, signature: number[]) =>
  signature.every((value, index) => bytes[index] === value);

const allowedByMime = new Map<string, AllowedMedia>([
  ["image/jpeg", { extension: ".jpg", kind: "IMAGE", maxBytes: IMAGE_MAX_BYTES, signature: (b) => startsWith(b, [0xff, 0xd8, 0xff]) }],
  ["image/png", { extension: ".png", kind: "IMAGE", maxBytes: IMAGE_MAX_BYTES, signature: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) }],
  ["image/gif", { extension: ".gif", kind: "IMAGE", maxBytes: IMAGE_MAX_BYTES, signature: (b) => {
    const header = Buffer.from(b.subarray(0, 6)).toString("ascii");
    return header === "GIF87a" || header === "GIF89a";
  } }],
  ["image/webp", { extension: ".webp", kind: "IMAGE", maxBytes: IMAGE_MAX_BYTES, signature: (b) =>
    Buffer.from(b.subarray(0, 4)).toString("ascii") === "RIFF" && Buffer.from(b.subarray(8, 12)).toString("ascii") === "WEBP" }],
  ["application/pdf", { extension: ".pdf", kind: "DOCUMENT", maxBytes: DOCUMENT_MAX_BYTES, signature: (b) =>
    Buffer.from(b.subarray(0, 5)).toString("ascii") === "%PDF-" }],
]);

const allowedExtensions = new Map([
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".pdf", "application/pdf"],
]);

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export type ValidatedUpload = {
  bytes: Uint8Array;
  kind: MediaKind;
  mimeType: string;
  byteSize: number;
  extension: string;
  originalName: string;
};

export function storageRoot() {
  if ((process.env.STORAGE_DRIVER || "local") !== "local") {
    throw new Error("Only the local storage driver is available in Phase 1.");
  }

  const configured = process.env.LOCAL_STORAGE_ROOT?.trim();
  if (process.env.NODE_ENV === "production" && !configured) {
    throw new Error("LOCAL_STORAGE_ROOT must be configured in production.");
  }
  if (process.env.NODE_ENV === "production" && configured && !path.isAbsolute(configured)) {
    throw new Error("LOCAL_STORAGE_ROOT must be an absolute path in production.");
  }

  return path.resolve(configured || path.join(process.cwd(), "storage", "uploads"));
}

export function resolveObjectPath(objectKey: string) {
  if (!/^[a-z0-9][a-z0-9/_-]*\.[a-z0-9]+$/.test(objectKey) || objectKey.includes("..") || objectKey.includes("\\")) {
    throw new Error("Invalid media object key.");
  }
  const root = storageRoot();
  const target = path.resolve(root, ...objectKey.split("/"));
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Media object path is outside the configured storage root.");
  }
  return target;
}

export async function validateUpload(file: File): Promise<ValidatedUpload> {
  if (!file || typeof file.arrayBuffer !== "function" || !file.name || file.size < 1) {
    throw new MediaValidationError("Choose a non-empty file to upload.");
  }

  const mimeType = file.type.toLowerCase().trim();
  const allowed = allowedByMime.get(mimeType);
  const suppliedExtension = path.extname(file.name).toLowerCase();
  if (!allowed || allowedExtensions.get(suppliedExtension) !== mimeType) {
    throw new MediaValidationError("Use a JPEG, PNG, GIF, WebP or PDF file with a matching file extension.");
  }
  if (file.size > allowed.maxBytes) {
    const limit = Math.round(allowed.maxBytes / 1024 / 1024);
    throw new MediaValidationError(`This file exceeds the ${limit} MB upload limit.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength !== file.size || !allowed.signature(bytes)) {
    throw new MediaValidationError("The file contents do not match the declared file type.");
  }

  const cleanedBase = path.basename(file.name, suppliedExtension).normalize("NFKC")
    .replace(/[^a-zA-Z0-9._ -]+/g, "-").replace(/\s+/g, " ").replace(/^\.+/, "").trim().slice(0, 160) || "upload";
  const displayExtension = allowed.extension === ".jpg" && suppliedExtension === ".jpeg" ? ".jpeg" : allowed.extension;
  return {
    bytes,
    kind: allowed.kind,
    mimeType,
    byteSize: bytes.byteLength,
    extension: allowed.extension,
    originalName: `${cleanedBase}${displayExtension}`,
  };
}

export function createObjectKey(kind: MediaKind, extension: string) {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${kind.toLowerCase()}/${now.getUTCFullYear()}/${month}/${randomUUID()}${extension}`;
}

export async function persistUpload(upload: ValidatedUpload, objectKey: string) {
  const target = resolveObjectPath(objectKey);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, upload.bytes, { flag: "wx", mode: 0o640 });
}

export async function readStoredMedia(objectKey: string) {
  return readFile(resolveObjectPath(objectKey));
}

export async function removeStoredMedia(objectKey: string) {
  try {
    await unlink(resolveObjectPath(objectKey));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export const mediaAccept = "image/jpeg,image/png,image/gif,image/webp,application/pdf";
export const mediaLimits = { image: IMAGE_MAX_BYTES, document: DOCUMENT_MAX_BYTES } as const;
