"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import Form from "@/components/Form";
import Image from "next/image";

interface FormProps {
  name: string;
  email: string;
  gender?: string;
}

export default function LoginPage() {
  const { setUser } = useUser();
  const { push } = useRouter();

  function nextPage() {
    push("/camera");
  }
  function onSubmitForm(values: FormProps) {
    register(values.name, values.email);
    setUser({ mail: values.email });
    nextPage();
  }
  return (
    <div>
      <div className="login w-screen h-screen flex flex-col justify-center items-center relative">
        <figure className="absolute top-0 left-0 w-[875px] h-[591px]">
          <Image src="/oracle/Recurso_2.png" alt="" width={875} height={591} />
        </figure>
        <figure className="absolute bottom-24 -right-28 w-[875px] h-[591px]">
          <Image src="/oracle/Recurso_3.png" alt="" width={875} height={591} />
        </figure>

        <figure className="z-50 mb-[123px]">
          <Image className="w-[654.75px] h-[86px]" src='/oracle/oracle_rojo.png' alt='logo oracle rojo' width={275} height={43} />
        </figure>
        <div>

          <Form onSave={onSubmitForm} />

        </div>

      </div>
    </div>
  );
}
