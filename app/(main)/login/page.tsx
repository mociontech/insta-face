"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import Form from "@/components/Form";
import Image from "next/image";

interface FormProps {
  name: string;
  email: string;
  gender: string;
}

export default function LoginPage() {
  const { setUser } = useUser();
  const { push } = useRouter();

  function nextPage() {
    push("/camera");
  }
  function onSubmitForm(values: FormProps) {
    register(values.name, values.email, values.gender);
    setUser({ mail: values.email });
    nextPage();
  }
  return (
    <div>
      <div className="login w-screen h-screen flex flex-col justify-center items-center relative">
        <figure className="mb-[164px]">
          <Image className="w-[654.75px] h-[86px]" src='/oracle/oracle_rojo.png' alt='logo oracle rojo' width={275} height={43} />
        </figure>
        <Form onSave={onSubmitForm} />
      </div>
    </div>
  );
}
