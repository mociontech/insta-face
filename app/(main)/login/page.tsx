"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import Form, { FormProps } from "@/components/Form";

export default function LoginPage() {
  const { setUser } = useUser();
  const { push } = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [forceRegister, setForceRegister] = useState(false);

  function start(cedula: string, name: string) {
    setUser({ mail: cedula, name, sessionId: crypto.randomUUID() });
    push("/select");
  }

  async function onSubmitForm(values: FormProps) {
    const cedula = values.cedula.replace(/\D/g, "");

    // Registro con nombre (quien no está en la base): entra con el nombre que escribió.
    if (values.mode === "nombre") {
      start(cedula, values.nombre.trim());
      return;
    }

    // Validación contra la base de asistentes (la misma de la pared y el tríptico).
    setNotice(null);
    try {
      const res = await fetch(`/api/enruta/attendee?cedula=${encodeURIComponent(cedula)}`);
      if (res.ok) {
        const found = (await res.json()) as { nombre: string };
        start(cedula, found.nombre);
        return;
      }
      if (res.status === 404) {
        const body = (await res.json().catch(() => ({}))) as { allowUnlisted?: boolean };
        if (body.allowUnlisted === false) {
          setNotice("Tu cédula no está en la lista de colaboradores.");
        } else {
          setNotice("No te encontramos en la lista. Regístrate con tu nombre.");
          setForceRegister(true);
        }
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      // Sin conexión con la base: se deja registrar con su nombre para no frenar la experiencia.
      setNotice("No pudimos validar tu cédula. Regístrate con tu nombre.");
      setForceRegister(true);
    }
  }

  return (
    <main
      className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d] bg-no-repeat"
      style={{
        backgroundImage: 'url("/ENRUTA/imagen2.png")',
        backgroundSize: "100% 100%",
      }}
    >
      <Form onSave={onSubmitForm} notice={notice} forceRegister={forceRegister} />
    </main>
  );
}
