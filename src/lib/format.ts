import { format, parseISO } from "date-fns";
import { el } from "date-fns/locale";

export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: el });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy", { locale: el });
  } catch {
    return iso;
  }
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function normalizePlate(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}
