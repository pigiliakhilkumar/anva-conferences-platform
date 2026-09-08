import { db } from "./db";

export async function audit(action: string, userId?: string, entityType?: string, entityId?: string, metadata?: Record<string, string | number | boolean>) {
  await db.auditEvent.create({ data: { action, userId, entityType, entityId, metadata: metadata ? JSON.stringify(metadata) : undefined } });
}
