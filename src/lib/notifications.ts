import { db } from "./db";
import type { NotificationType } from "@prisma/client";
export function notify(userId: string, type: NotificationType, title: string, body: string) { return db.notification.create({ data: { userId, type, title, body } }); }
