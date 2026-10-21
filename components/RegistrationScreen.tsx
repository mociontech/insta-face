"use client";

import { useRouter } from "next/navigation";
import Form, { type FormProps } from "@/components/Form";
import ExperienceScreen from "@/components/ExperienceScreen";
import { useUser } from "@/hooks/useUser";
import { Registros, mensajeDe } from "@/lib/api";
import { enviarEvius, recordarContacto, registrarContactoEnEvius } from "@/lib/evius";
import type { RegistrationMode } from "@/lib/registration";

export default function RegistrationScreen({ mode }: { mode: RegistrationMode }) {
  const router = useRouter();
  const { setUser, setUrl } = useUser();

  /**
   * Registro nuevo: el servidor genera el ID (321-321, el mismo en todas las experiencias del evento) y se muestra en
   * "Tu ID unico". Con un ID existente: se valida en el servidor y se entra directo. Los errores se lanzan para que el
   * formulario los muestre.
   */
  async function start(values: FormProps) {
    setUrl("");
    const sessionId = crypto.randomUUID();

    if (mode === "id") {
      let persona;
      try {
        persona = await Registros.buscarPorId(values.idCode);
      } catch (error) {
        throw new Error(mensajeDe(error));
      }
      if (!persona) throw new Error("No encontramos ese ID. Revisalo e intentalo de nuevo.");
      if (persona.jugado) {
        router.push("/ya-registrado");
        return;
      }
      // La persona ya estaba registrada: se rescata su contacto de la base para mandarla a Evius.
      // La participacion (con el puntaje) se envia al terminar la experiencia (pantalla del QR).
      registrarContactoEnEvius(persona.id, persona.nombre, persona.contacto);
      setUser({ mail: persona.id, name: persona.nombre, idCode: persona.id, registrationMode: "id", sessionId });
      router.push("/select");
      return;
    }

    try {
      const persona = await Registros.guardar({ nombre: values.name, celular: values.phone, empresa: values.company, correo: values.email });
      // La base ya confirmo el registro: lo mismo va a Evius en segundo plano (con cola y reintentos).
      // La participacion se envia al terminar la experiencia (pantalla del QR).
      const contacto = { email: values.email, fullName: values.name, phone: values.phone, company: values.company };
      recordarContacto(persona.id, contacto);
      enviarEvius(contacto);
      setUser({ mail: values.email, name: persona.nombre, company: values.company, phone: values.phone, idCode: persona.id, registrationMode: "details", sessionId });
    } catch (error) {
      throw new Error(mensajeDe(error));
    }
    router.push("/tu-id");
  }

  return <ExperienceScreen screen={mode === "id" ? "registrationId" : "login"}><Form mode={mode} onSave={start} /></ExperienceScreen>;
}
