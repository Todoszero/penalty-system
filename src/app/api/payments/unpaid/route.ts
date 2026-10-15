import { NextRequest, NextResponse } from "next/server";
import { listUnpaidByPlate } from "@/lib/storage";
import { violationLabel } from "@/lib/violations";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const plate = request.nextUrl.searchParams.get("plate")?.trim() ?? "";
  if (!plate) {
    return NextResponse.json(
      { error: "Απαιτείται αριθμός πινακίδας." },
      { status: 400 }
    );
  }

  const citations = await listUnpaidByPlate(plate);
  return NextResponse.json({
    citations: citations.map((c) => ({
      id: c.id,
      number: c.number,
      plateNumber: c.plateNumber,
      fineAmount: c.fineAmount,
      occurredAt: c.occurredAt,
      location: c.location,
      portAuthority: c.portAuthority,
      status: c.status,
      fullName: c.fullName,
      violations: (c.violationIds ?? []).map((id) => violationLabel(id)),
    })),
  });
}
