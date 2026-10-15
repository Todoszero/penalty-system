import { NextRequest, NextResponse } from "next/server";
import { getCitation, updateCitation } from "@/lib/storage";
import type { CitationUpdate } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const citation = await getCitation(id);
  if (!citation) {
    return NextResponse.json({ error: "Η κλήση δεν βρέθηκε." }, { status: 404 });
  }
  return NextResponse.json({ citation });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = (await request.json()) as CitationUpdate;
    const citation = await updateCitation(id, body);
    if (!citation) {
      return NextResponse.json({ error: "Η κλήση δεν βρέθηκε." }, { status: 404 });
    }
    return NextResponse.json({ citation });
  } catch {
    return NextResponse.json(
      { error: "Αποτυχία ενημέρωσης κλήσης." },
      { status: 500 }
    );
  }
}
