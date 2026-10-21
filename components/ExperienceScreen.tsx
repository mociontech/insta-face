import type { ReactNode } from "react";
import { experience, screenStyle } from "@/lib/experience";

export default function ExperienceScreen({ screen, children }: {
  screen: keyof typeof experience.screens;
  children: ReactNode;
}) {
  return (
    <main className="experience-viewport">
      <section className="experience-stage" style={screenStyle(screen)} aria-label={experience.name}>
        <h1 className="sr-only">{experience.name}</h1>
        {children}
      </section>
    </main>
  );
}
