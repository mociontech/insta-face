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
    setNotice(null);

    // Validación contra la base de asistentes (la misma de la pared y el tríptico) y control de una sola participación.
    let status = 0;
    let body: { nombre?: string; played?: boolean; allowUnlisted?: boolean } = {};
    try {
      const res = await fetch(`/api/enruta/attendee?cedula=${encodeURIComponent(cedula)}`);
      status = res.status;
      body = (await res.json().catch(() => ({}))) as typeof body;
    } catch {
      status = 0;
    }

    if (body.played) {
      setNotice("Esta cédula ya participó en Insta Face. Solo se puede una vez por persona.");
      return;
    }

    // Registro con nombre (quien no está en la base): entra con el nombre que escribió.
    if (values.mode === "nombre") {
      start(cedula, values.nombre.trim());
      return;
    }

    if (status === 200 && body.nombre) {
      start(cedula, body.nombre);
    } else if (status === 404 && body.allowUnlisted === false) {
      setNotice("Tu cédula no está en la lista de colaboradores.");
    } else if (status === 404) {
      setNotice("No te encontramos en la lista. Regístrate con tu nombre.");
      setForceRegister(true);
    } else {
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
