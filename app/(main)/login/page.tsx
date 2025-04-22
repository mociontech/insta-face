"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import Form from "@/components/Form";

interface FormProps {
  name: string;
  dni: string;
  gender: string;
  // termsSAP: boolean;
}

export default function LoginPage() {
  const { setUser } = useUser();
  const { push } = useRouter();

  function nextPage() {
    push("/camera");
  }
  function onSubmitForm(values: FormProps) {
    register(values.name, values.dni, values.gender);
    setUser({ dni: values.dni });
    nextPage();
  }
  return (
    <div>
      <div className="login w-screen h-screen flex flex-col justify-start items-center relative">
        <Form onSave={onSubmitForm} />
      </div>
    </div>
  );
}
