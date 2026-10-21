import { LoaderCircle } from "lucide-react";
import { experience, artRect } from "@/lib/experience";
import ExperienceScreen from "@/components/ExperienceScreen";

export default function Loader({ message = "Procesando tu foto" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50" role="status" aria-live="polite" aria-label={message}>
      <ExperienceScreen screen="loading">
        {experience.loader ? <div aria-hidden="true" className="absolute" style={artRect(335, 645, 410, 410)}>
          <img src={experience.loader} alt="" className="absolute inset-0 h-full w-full object-contain opacity-90" style={{ filter: "brightness(0)", transform: "rotate(180deg)" }} />
          <img src={experience.loader} alt="" className="absolute inset-0 h-full w-full object-contain" />
        </div> : <LoaderCircle aria-hidden="true" className="absolute left-[44%] top-[40%] h-12 w-12 animate-spin" />}
        <p className="sr-only">{message}</p>
      </ExperienceScreen>
    </div>
  );
}
