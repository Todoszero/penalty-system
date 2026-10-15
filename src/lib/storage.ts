import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Citation, CitationInput, CitationUpdate } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "citations.json");

async function ensureStore(): Promise<Citation[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Citation[];
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

async function writeStore(citations: Citation[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(citations, null, 2), "utf8");
}

function nextNumber(citations: Citation[]): string {
  const max = citations.reduce((acc, c) => {
    const n = Number.parseInt(c.number, 10);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return String(max + 1).padStart(5, "0");
}

export async function listCitations(filters?: {
  plate?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Citation[]> {
  let items = await ensureStore();

  if (filters?.plate) {
    const q = filters.plate.replace(/\s+/g, "").toUpperCase();
    items = items.filter((c) =>
      c.plateNumber.replace(/\s+/g, "").toUpperCase().includes(q)
    );
  }

  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom);
    items = items.filter((c) => new Date(c.occurredAt) >= from);
  }

  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    // include full day when only date is provided
    if (/^\d{4}-\d{2}-\d{2}$/.test(filters.dateTo)) {
      to.setHours(23, 59, 59, 999);
    }
    items = items.filter((c) => new Date(c.occurredAt) <= to);
  }

  return items.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

export async function getCitation(id: string): Promise<Citation | null> {
  const items = await ensureStore();
  return items.find((c) => c.id === id) ?? null;
}

export async function createCitation(input: CitationInput): Promise<Citation> {
  const items = await ensureStore();
  const now = new Date().toISOString();
  const citation: Citation = {
    ...input,
    id: randomUUID(),
    number: nextNumber(items),
    createdAt: now,
    updatedAt: now,
    status: "awaiting_objection",
    objectionOutcome: "pending",
    suspensionDays: input.suspensionDays ?? null,
    commanderDecisionAt: null,
    commanderNotes: input.commanderNotes ?? "",
    paymentReference: null,
    paidAt: null,
  };
  items.push(citation);
  await writeStore(items);
  return citation;
}

export async function updateCitation(
  id: string,
  patch: CitationUpdate
): Promise<Citation | null> {
  const items = await ensureStore();
  const index = items.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated: Citation = {
    ...items[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  items[index] = updated;
  await writeStore(items);
  return updated;
}

export async function seedIfEmpty(seed: Citation[]): Promise<number> {
  const items = await ensureStore();
  if (items.length > 0) return 0;
  await writeStore(seed);
  return seed.length;
}
