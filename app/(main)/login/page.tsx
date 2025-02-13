"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import Form from "@/components/Form";

interface FormProps {
  name: string;
  email: string;
  phone: string;
  termsSAP: boolean;
}

export default function LoginPage() {
  const { setUser } = useUser();
  const { push } = useRouter();

  function nextPage() {
    push("/camera");
  }
  function onSubmitForm(values: FormProps) {
    register(values.name, values.email, values.phone);
    setUser({ mail: values.email });
    nextPage();
  }
  return (
    <div>
      <div className="login flex items-center justify-center h-screen flex-col">
        <Form onSave={onSubmitForm} />
      </div>
    </div>
  );
}
