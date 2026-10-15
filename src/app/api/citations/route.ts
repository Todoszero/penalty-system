import { NextRequest, NextResponse } from "next/server";
import { createCitation, listCitations, seedIfEmpty } from "@/lib/storage";
import { SEED_CITATIONS } from "@/lib/seed";
import type { CitationInput } from "@/lib/types";

export const runtime = "nodejs";

async function ensureSeed() {
  await seedIfEmpty(SEED_CITATIONS);
}

export async function GET(request: NextRequest) {
  await ensureSeed();
  const { searchParams } = request.nextUrl;
  const citations = await listCitations({
    plate: searchParams.get("plate") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  });
  return NextResponse.json({ citations });
}

export async function POST(request: NextRequest) {
  await ensureSeed();
  try {
    const body = (await request.json()) as CitationInput;
    if (!body.plateNumber?.trim()) {
      return NextResponse.json(
        { error: "Απαιτείται αριθμός κυκλοφορίας." },
        { status: 400 }
      );
    }
    if (!body.occurredAt) {
      return NextResponse.json(
        { error: "Απαιτείται ημερομηνία και ώρα παράβασης." },
        { status: 400 }
      );
    }
    if (!body.violationIds?.length) {
      return NextResponse.json(
        { error: "Επιλέξτε τουλάχιστον μία παράβαση." },
        { status: 400 }
      );
    }
    const citation = await createCitation({
      ...body,
      plateNumber: body.plateNumber.trim().toUpperCase(),
      fineAmount: Number(body.fineAmount) || 0,
      seizedItems: body.seizedItems ?? [],
      violationIds: body.violationIds ?? [],
      authority:
        body.authority ||
        "Υπουργείο Ναυτιλίας και Νησιωτικής Πολιτικής",
      portAuthority: body.portAuthority || "Λέσβου",
    });
    return NextResponse.json({ citation }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Αποτυχία καταχώρησης κλήσης." },
      { status: 500 }
    );
  }
}
