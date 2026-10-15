"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SignaturePadProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
};

export function SignaturePad({ open, onCancel, onConfirm }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setHasInk(false);
    setError(null);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(220 * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = "220px";
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, 220);
      ctx.strokeStyle = "#0f2744";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [open]);

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    const { x, y } = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setError(null);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointFromEvent(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, 220);
    setHasInk(false);
    setError(null);
  }

  function confirm() {
    if (!hasInk) {
      setError("Απαιτείται υπογραφή του παραβάτη.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    onConfirm(canvas.toDataURL("image/png"));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signature-title"
        className="w-full max-w-lg rounded-2xl border border-[color:var(--sea-line)] bg-white p-4 shadow-xl sm:p-6"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p
              id="signature-title"
              className="flex items-center gap-2 font-heading text-lg text-[color:var(--sea-ink)]"
            >
              <PenLine className="size-4 text-[color:var(--sea-foam-deep)]" />
              Υπογραφή παραβάτη
            </p>
            <p className="mt-1 text-sm text-[color:var(--sea-muted)]">
              Υπογράψτε με το δάχτυλο ή το stylus στην περιοχή κάτω.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={onCancel}
            aria-label="Κλείσιμο"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border-2 border-dashed border-[color:var(--sea-line)] bg-white touch-none">
          <canvas
            ref={canvasRef}
            className="block w-full cursor-crosshair touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={clear}
          >
            <Eraser className="size-4" />
            Καθαρισμός
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 sm:flex-none"
              onClick={onCancel}
            >
              Ακύρωση
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 bg-[color:var(--sea-foam-deep)] text-white hover:bg-[color:var(--sea-foam-deep)]/90 sm:flex-none"
              onClick={confirm}
            >
              Επιβεβαίωση & καταχώρηση
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
