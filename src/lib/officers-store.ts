import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Officer } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "officers.json");

async function ensureStore(): Promise<Officer[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Officer[];
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

async function writeStore(officers: Officer[]): Promise<void> {
  if (!Array.isArray(officers)) {
    throw new Error("Invalid officers store payload");
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(officers, null, 2), "utf8");
}

export async function listOfficers(): Promise<Officer[]> {
  const items = await ensureStore();
  return items.sort((a, b) =>
    a.fullName.localeCompare(b.fullName, "el", { sensitivity: "base" })
  );
}

export async function createOfficer(fullName: string): Promise<Officer> {
  const name = fullName.trim().replace(/\s+/g, " ");
  if (!name) {
    throw new Error("EMPTY_NAME");
  }
  const items = await ensureStore();
  const exists = items.some(
    (o) => o.fullName.localeCompare(name, "el", { sensitivity: "base" }) === 0
  );
  if (exists) {
    throw new Error("DUPLICATE");
  }
  const officer: Officer = {
    id: randomUUID(),
    fullName: name,
    createdAt: new Date().toISOString(),
  };
  items.push(officer);
  await writeStore(items);
  return officer;
}

export async function deleteOfficer(id: string): Promise<boolean> {
  const items = await ensureStore();
  const next = items.filter((o) => o.id !== id);
  if (next.length === items.length) return false;
  await writeStore(next);
  return true;
}

export async function seedOfficersIfEmpty(seed: Officer[]): Promise<number> {
  const items = await ensureStore();
  if (items.length > 0) return 0;
  const initial = Array.isArray(seed) ? seed : [];
  await writeStore(initial);
  return initial.length;
}
