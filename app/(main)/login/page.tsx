"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import Form, { FormProps } from "@/components/Form";

export default function LoginPage() {
  const { setUser } = useUser();
  const { push } = useRouter();

  function onSubmitForm(values: FormProps) {
    const identifier = values.mode === "cedula" ? values.cedula : values.nombre;
    const displayName = values.nombre || values.cedula;

    register(displayName, identifier, "");
    setUser({ mail: identifier });
    push("/select");
  }

  return (
    <main
      className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d] bg-no-repeat"
      style={{
        backgroundImage: 'url("/ENRUTA/imagen2.png")',
        backgroundSize: "100% 100%",
      }}
    >
      <Form onSave={onSubmitForm} />
    </main>
  );
}
