"use client";

import { useRouter } from "next/navigation";
import Form, { type FormProps } from "@/components/Form";
import ExperienceScreen from "@/components/ExperienceScreen";
import { useUser } from "@/hooks/useUser";
import type { RegistrationMode } from "@/lib/registration";

export default function RegistrationScreen({ mode }: { mode: RegistrationMode }) {
  const router = useRouter();
  const { setUser, setUrl } = useUser();

  function start(values: FormProps) {
    // Backend validation will be connected here; this only starts a local session.
    setUrl("");
    setUser({ mail: mode === "id" ? values.idCode : values.email, name: values.name, company: values.company, phone: values.phone, idCode: values.idCode, registrationMode: mode, sessionId: crypto.randomUUID() });
    router.push("/select");
  }

  return <ExperienceScreen screen={mode === "id" ? "registrationId" : "login"}><Form mode={mode} onSave={start} /></ExperienceScreen>;
}
