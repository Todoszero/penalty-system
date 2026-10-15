import { NextRequest, NextResponse } from "next/server";
import {
  createPortAuthority,
  listPortAuthorities,
  seedPortAuthoritiesIfEmpty,
} from "@/lib/port-authorities-store";
import { SEED_PORT_AUTHORITIES } from "@/lib/seed-port-authorities";

export const runtime = "nodejs";

async function ensureSeed() {
  await seedPortAuthoritiesIfEmpty(SEED_PORT_AUTHORITIES);
}

export async function GET() {
  await ensureSeed();
  const portAuthorities = await listPortAuthorities();
  return NextResponse.json({ portAuthorities });
}

export async function POST(request: NextRequest) {
  await ensureSeed();
  try {
    const body = (await request.json()) as { name?: string };
    const portAuthority = await createPortAuthority(body.name ?? "");
    return NextResponse.json({ portAuthority }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "EMPTY_NAME") {
      return NextResponse.json(
        { error: "Απαιτείται όνομα λιμενικής αρχής." },
        { status: 400 }
      );
    }
    if (code === "DUPLICATE") {
      return NextResponse.json(
        { error: "Υπάρχει ήδη αυτή η λιμενική αρχή." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Αποτυχία καταχώρησης λιμενικής αρχής." },
      { status: 500 }
    );
  }
}
