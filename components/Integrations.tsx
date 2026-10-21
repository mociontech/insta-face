"use client";

import { useEffect } from "react";
import { initOutboxFlush } from "@/lib/outbox";

/** Arranca los reintentos del resultado que no se pudo enviar al servidor. Se monta una vez. */
export default function Integrations() {
  useEffect(() => {
    return initOutboxFlush();
  }, []);
  return null;
}
