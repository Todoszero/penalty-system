import { NextRequest, NextResponse } from "next/server";
import {
  acknowledgePaymentNotification,
  listPaymentNotifications,
} from "@/lib/payments-store";
import { getCitation, updateCitation } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const pendingOnly =
    request.nextUrl.searchParams.get("pending") !== "false";
  const notifications = await listPaymentNotifications({ pendingOnly });
  return NextResponse.json({ notifications });
}

/** Ο διοικητής επιβεβαιώνει εξόφληση από την ειδοποίηση. */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      notificationId?: string;
      action?: "acknowledge" | "mark_paid";
    };
    const notificationId = body.notificationId?.trim();
    if (!notificationId) {
      return NextResponse.json(
        { error: "Απαιτείται ειδοποίηση." },
        { status: 400 }
      );
    }

    const notifications = await listPaymentNotifications({
      pendingOnly: false,
    });
    const current = notifications.find((n) => n.id === notificationId);
    if (!current) {
      return NextResponse.json(
        { error: "Η ειδοποίηση δεν βρέθηκε." },
        { status: 404 }
      );
    }

    const action = body.action ?? "mark_paid";
    let citation = await getCitation(current.citationId);

    if (action === "mark_paid" && citation) {
      citation = await updateCitation(current.citationId, {
        status: "paid",
        paidAt: new Date().toISOString(),
        paymentReference:
          current.providerRef ||
          `${current.citationNumber}-${current.plateNumber.replace(/\s+/g, "")}`,
      });
    }

    const notification = await acknowledgePaymentNotification(notificationId);
    return NextResponse.json({ notification, citation });
  } catch {
    return NextResponse.json(
      { error: "Αποτυχία επεξεργασίας ειδοποίησης." },
      { status: 500 }
    );
  }
}
