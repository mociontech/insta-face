"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import Form from "@/components/Form";

interface FormProps {
  cedula: string;
  acceptedPolicy: boolean;
}

export default function LoginPage() {
  const { setUser } = useUser();
  const { push } = useRouter();

  function onSubmitForm(values: FormProps) {
    register(values.cedula, values.cedula, "");
    setUser({ mail: values.cedula });
    push("/select");
  }

  return (
    <main
      className="relative h-screen min-h-screen w-full overflow-hidden bg-[#06194d] bg-no-repeat"
      style={{
        backgroundImage: 'url("/ENRUTA/enruta2.png")',
        backgroundSize: "100% 100%",
      }}
    >
      <Form onSave={onSubmitForm} />
    </main>
  );
}
