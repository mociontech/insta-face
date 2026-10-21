"use client";

import { useEffect } from "react";
import { iniciarEnvioEvius } from "@/lib/evius";
import { initOutboxFlush } from "@/lib/outbox";

/** Arranca los reintentos de lo que no se pudo enviar (resultado a la base y registros a Evius). Se monta una vez. */
export default function Integrations() {
  useEffect(() => {
    const stopOutbox = initOutboxFlush();
    const stopEvius = iniciarEnvioEvius();
    return () => {
      stopOutbox();
      stopEvius();
    };
  }, []);
  return null;
}
