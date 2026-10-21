"use client";

import Link from "next/link";
import ExperienceScreen from "@/components/ExperienceScreen";
import { artRect } from "@/lib/experience";
import { useUser } from "@/hooks/useUser";

export default function WelcomePage() {
  const reset = useUser((state) => state.reset);
  return (
    <ExperienceScreen screen="welcome">
      <Link href="/login" onClick={reset} aria-label="Iniciar" className="art-hit-area" style={artRect(193, 1346, 694, 133)}><span className="sr-only">Iniciar</span></Link>
    </ExperienceScreen>
  );
}
