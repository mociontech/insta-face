"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import Form from "@/components/Form";
import Image from "next/image";

interface FormProps {
  name: string;
  email: string;
}

export default function LoginPage() {
  const { setUser } = useUser();
  const { push } = useRouter();

  function nextPage() {
    push("/camera");
  }

  function onSubmitForm(values: FormProps) {
    nextPage();
    register(values.name, values.email, "");
    setUser({ mail: values.email });
  }

  return (
    <div className="login min-h-screen w-full flex flex-col items-center justify-center px-[clamp(1rem,5vw,6rem)] py-[clamp(2rem,5vh,8rem)]">
      <section className="max-w-[1200px] w-full">
        <figure className="absolute top-0 left-0 z-10 w-[300px] sm:w-[300px] md:w-[500px] lg:w-[600px] h-auto">
          <Image src="/oracle/Recurso_2.png" alt="" width={875} height={591} className="w-full h-auto" />
        </figure>
        <figure className="absolute bottom-0 right-0  z-10 w-[220px] sm:w-[220px] md:w-[420px] lg:w-[520px] h-auto">
          <Image src="/oracle/Recurso_1.png" alt="" width={626} height={602} className="w-full h-auto" />
        </figure>
        <div className="flex flex-col justify-center items-center gap-4 px-6 sm:px-12 md:px-24 lg:px-[137px] mt-16 sm:mt-24 lg:mt-32 max-w-[90%]">
          <div className="flex flex-col justify-center items-center gap-14 w-full px-4">
            <figure className="w-[240px] h-auto z-50">
              <Image
                alt="oracle logo rojo"
                src="/oracle/oracle_rojo.png"
                width={275}
                height={43}
                className="w-full h-auto"
              />
            </figure>
            <h2 className="text-[30px] font-bold text-[#382F2B]">Regístrate</h2>


            <Form onSave={onSubmitForm} />
          </div>
        </div>
      </section>
    </div>
  );
}
