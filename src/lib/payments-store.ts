import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Citation, PaymentNotification } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "payment-notifications.json");

async function ensureStore(): Promise<PaymentNotification[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as PaymentNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
      return [];
    }
    throw error;
  }
}

async function writeStore(items: PaymentNotification[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function listPaymentNotifications(options?: {
  pendingOnly?: boolean;
}): Promise<PaymentNotification[]> {
  let items = await ensureStore();
  if (options?.pendingOnly) {
    items = items.filter((n) => n.status === "pending");
  }
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createPaymentNotification(
  citation: Citation,
  providerRef?: string | null
): Promise<PaymentNotification> {
  const items = await ensureStore();
  const existing = items.find(
    (n) => n.citationId === citation.id && n.status === "pending"
  );
  if (existing) {
    return existing;
  }

  const notification: PaymentNotification = {
    id: randomUUID(),
    citationId: citation.id,
    citationNumber: citation.number,
    plateNumber: citation.plateNumber,
    fineAmount: citation.fineAmount,
    fullName: citation.fullName || "Άγνωστος οδηγός",
    officerName: citation.officerName,
    location: citation.location,
    occurredAt: citation.occurredAt,
    portAuthority: citation.portAuthority,
    createdAt: new Date().toISOString(),
    status: "pending",
    providerRef: providerRef ?? `EVERYPAY-SIM-${citation.number}`,
  };
  items.push(notification);
  await writeStore(items);
  return notification;
}

export async function acknowledgePaymentNotification(
  id: string
): Promise<PaymentNotification | null> {
  const items = await ensureStore();
  const index = items.findIndex((n) => n.id === id);
  if (index === -1) return null;
  const updated: PaymentNotification = {
    ...items[index],
    status: "acknowledged",
  };
  items[index] = updated;
  await writeStore(items);
  return updated;
}

export async function getPendingByCitationId(
  citationId: string
): Promise<PaymentNotification | null> {
  const items = await ensureStore();
  return (
    items.find((n) => n.citationId === citationId && n.status === "pending") ??
    null
  );
}
