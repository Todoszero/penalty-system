import { NextRequest, NextResponse } from "next/server";
import {
  createOfficer,
  listOfficers,
  seedOfficersIfEmpty,
} from "@/lib/officers-store";
import { SEED_OFFICERS } from "@/lib/seed-officers";

export const runtime = "nodejs";

async function ensureSeed() {
  await seedOfficersIfEmpty(SEED_OFFICERS);
}

export async function GET() {
  await ensureSeed();
  const officers = await listOfficers();
  return NextResponse.json({ officers });
}

export async function POST(request: NextRequest) {
  await ensureSeed();
  try {
    const body = (await request.json()) as { fullName?: string };
    const officer = await createOfficer(body.fullName ?? "");
    return NextResponse.json({ officer }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "EMPTY_NAME") {
      return NextResponse.json(
        { error: "Απαιτείται ονοματεπώνυμο λιμενικού." },
        { status: 400 }
      );
    }
    if (code === "DUPLICATE") {
      return NextResponse.json(
        { error: "Υπάρχει ήδη λιμενικός με αυτό το ονοματεπώνυμο." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Αποτυχία καταχώρησης λιμενικού." },
      { status: 500 }
    );
  }
}
