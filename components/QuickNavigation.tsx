"use client";

import { ArrowLeft, House } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const gestureWindowMs = 1200;

export default function QuickNavigation() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const taps = useRef({ count: 0, startedAt: 0 });

  useEffect(() => {
    let pointer: { id: number; x: number; y: number; startedAt: number } | null = null;

    function resetTaps() {
      taps.current = { count: 0, startedAt: 0 };
    }

    function onPointerDown(event: PointerEvent) {
      const topHeight = Math.min(120, Math.max(64, window.innerHeight * 0.12));
      const isControl = event.target instanceof Element && event.target.closest("[data-quick-navigation]");

      if (!event.isPrimary || event.button !== 0 || event.clientY > topHeight || isControl) {
        pointer = null;
        resetTaps();
        return;
      }

      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, startedAt: event.timeStamp };
    }

    function onPointerUp(event: PointerEvent) {
      if (!pointer || pointer.id !== event.pointerId) return;
      const start = pointer;
      pointer = null;

      if (event.timeStamp - start.startedAt > 400 || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 16) {
        resetTaps();
        return;
      }

      if (event.timeStamp - taps.current.startedAt > gestureWindowMs) resetTaps();
      if (taps.current.count === 0) taps.current.startedAt = event.timeStamp;
      taps.current.count += 1;

      if (taps.current.count === 3) {
        setVisible((current) => !current);
        resetTaps();
      }
    }

    function onPointerCancel() {
      pointer = null;
      resetTaps();
    }

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerCancel, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("pointercancel", onPointerCancel, true);
    };
  }, []);

  if (!visible) return null;

  return (
    <nav
      aria-label="Navegacion rapida"
      data-quick-navigation
      className="fixed right-[max(12px,env(safe-area-inset-right))] top-[max(12px,env(safe-area-inset-top))] z-[100] flex gap-2"
    >
      <button
        type="button"
        aria-label="Volver"
        title="Volver a la pagina anterior"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#06194d] shadow-md transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={() => window.history.length > 1 ? router.back() : router.push("/")}
      >
        <ArrowLeft size={24} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <Link
        href="/"
        aria-label="Ir al inicio"
        title="Ir al inicio"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff7300] text-white shadow-md transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <House size={24} strokeWidth={2.5} aria-hidden="true" />
      </Link>
    </nav>
  );
}
