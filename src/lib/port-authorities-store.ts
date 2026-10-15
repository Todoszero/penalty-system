import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { PortAuthority } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "port-authorities.json");

async function ensureStore(): Promise<PortAuthority[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as PortAuthority[];
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

async function writeStore(items: PortAuthority[]): Promise<void> {
  if (!Array.isArray(items)) {
    throw new Error("Invalid port authorities store payload");
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function listPortAuthorities(): Promise<PortAuthority[]> {
  const items = await ensureStore();
  return items.sort((a, b) =>
    a.name.localeCompare(b.name, "el", { sensitivity: "base" })
  );
}

export async function createPortAuthority(name: string): Promise<PortAuthority> {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    throw new Error("EMPTY_NAME");
  }
  const items = await ensureStore();
  const exists = items.some(
    (o) => o.name.localeCompare(trimmed, "el", { sensitivity: "base" }) === 0
  );
  if (exists) {
    throw new Error("DUPLICATE");
  }
  const entry: PortAuthority = {
    id: randomUUID(),
    name: trimmed,
    createdAt: new Date().toISOString(),
  };
  items.push(entry);
  await writeStore(items);
  return entry;
}

export async function deletePortAuthority(id: string): Promise<boolean> {
  const items = await ensureStore();
  const next = items.filter((o) => o.id !== id);
  if (next.length === items.length) return false;
  await writeStore(next);
  return true;
}

export async function seedPortAuthoritiesIfEmpty(
  seed: PortAuthority[]
): Promise<number> {
  const items = await ensureStore();
  if (items.length > 0) return 0;
  const initial = Array.isArray(seed) ? seed : [];
  await writeStore(initial);
  return initial.length;
}
