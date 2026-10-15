import { NextResponse } from "next/server";
import { deleteOfficer } from "@/lib/officers-store";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const removed = await deleteOfficer(id);
  if (!removed) {
    return NextResponse.json(
      { error: "Δεν βρέθηκε ο λιμενικός." },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
