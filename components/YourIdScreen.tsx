"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ExperienceScreen from "@/components/ExperienceScreen";
import { useUser } from "@/hooks/useUser";
import { artRect } from "@/lib/experience";

/** Muestra el ID que acaba de generar el servidor. Es el codigo con el que la persona entra a las demas experiencias. */
export default function YourIdScreen() {
  const router = useRouter();
  const { user, reset } = useUser();
  const [first = "", last = ""] = (user.idCode ?? "").split("-");

  useEffect(() => {
    if (!user.idCode) router.replace("/login");
  }, [user.idCode, router]);

  if (!user.idCode) return null;

  return (
    <ExperienceScreen screen="yourId">
      <output className="art-id" style={artRect(177, 995, 320, 154)} aria-label="Primeros tres digitos de tu ID">{first}</output>
      <output className="art-id" style={artRect(561, 995, 320, 154)} aria-label="Ultimos tres digitos de tu ID">{last}</output>
      <button type="button" aria-label="Comenzar" className="art-hit-area" style={artRect(198, 1243, 684, 133)} onClick={() => router.push("/select")}>
        <span className="sr-only">Comenzar</span>
      </button>
      {/* El registro ya quedo guardado: volver reinicia la estacion, no vuelve al formulario. */}
      <button type="button" aria-label="Volver al inicio" className="art-hit-area" style={artRect(860, 1680, 170, 135)} onClick={() => { reset(); router.replace("/"); }}>
        <span className="sr-only">Volver al inicio</span>
      </button>
    </ExperienceScreen>
  );
}
