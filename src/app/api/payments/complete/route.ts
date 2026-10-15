import { NextRequest, NextResponse } from "next/server";
import { getCitation } from "@/lib/storage";
import {
  createPaymentNotification,
  getPendingByCitationId,
} from "@/lib/payments-store";
import { isUnpaidStatus } from "@/lib/status";

export const runtime = "nodejs";

/**
 * Προσομοίωση ολοκλήρωσης πληρωμής (EveryPay callback/webhook).
 * Δημιουργεί ειδοποίηση στο Admin — δεν αλλάζει αυτόματα σε «εξοφλημένη».
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      citationId?: string;
      providerRef?: string;
    };
    const citationId = body.citationId?.trim();
    if (!citationId) {
      return NextResponse.json(
        { error: "Απαιτείται κλήση." },
        { status: 400 }
      );
    }

    const citation = await getCitation(citationId);
    if (!citation) {
      return NextResponse.json(
        { error: "Η κλήση δεν βρέθηκε." },
        { status: 404 }
      );
    }
    if (!isUnpaidStatus(citation.status)) {
      return NextResponse.json(
        { error: "Η κλήση δεν είναι ανεξόφλητη." },
        { status: 400 }
      );
    }

    const existing = await getPendingByCitationId(citation.id);
    if (existing) {
      return NextResponse.json({
        notification: existing,
        alreadyNotified: true,
      });
    }

    const notification = await createPaymentNotification(
      citation,
      body.providerRef ?? null
    );
    return NextResponse.json({ notification, alreadyNotified: false }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Αποτυχία καταχώρησης πληρωμής." },
      { status: 500 }
    );
  }
}
