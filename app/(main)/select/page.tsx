import Link from "next/link";
import ExperienceScreen from "@/components/ExperienceScreen";
import { artRect } from "@/lib/experience";

export default function SelectIntroPage() {
  return (
    <ExperienceScreen screen="instructions">
      <Link href="/camera" aria-label="Seleccionar avatar" className="art-hit-area" style={artRect(198, 1321, 684, 134)}><span className="sr-only">Iniciar</span></Link>
    </ExperienceScreen>
  );
}
