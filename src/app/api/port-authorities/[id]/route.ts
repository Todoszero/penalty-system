import { NextResponse } from "next/server";
import { deletePortAuthority } from "@/lib/port-authorities-store";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const removed = await deletePortAuthority(id);
  if (!removed) {
    return NextResponse.json(
      { error: "Δεν βρέθηκε η λιμενική αρχή." },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
