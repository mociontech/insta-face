import Link from "next/link";
import ExperienceScreen from "@/components/ExperienceScreen";
import { artRect } from "@/lib/experience";

export default function AlreadyRegisteredPage() {
  return (
    <ExperienceScreen screen="alreadyRegistered">
      <p className="sr-only" role="alert">Parece que ya participaste en esta experiencia. Gracias.</p>
      <Link href="/registro-id" className="art-hit-area" aria-label="Volver a digitar ID" style={artRect(860, 1680, 170, 135)}><span className="sr-only">Volver</span></Link>
    </ExperienceScreen>
  );
}
