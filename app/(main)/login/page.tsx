"use client";

import { useCallback, useState } from "react";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Register from "@/components/Register";
import { registerToFirebase } from "@/lib/db";

export default function RegisterExperiencePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setGender, setUser } = useUser();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  async function registerUser(form) {
    try {
      setIsLoading(true);
      await registerToFirebase(
        form.nombre.value,
        form.correo.value,
        form.sexo.value
      );

      setGender(form.sexo.value);
      setUser(form.correo.value);
      router.push("/camera");
    } catch {
      Toast("No fue posible registrar el usuario.");
      setIsLoading(false);
    }
  }

  const Toast = useCallback((msg: string) => {
    setShowToast(true);
    setToastMessage(msg);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  return (
    <div className="login relative h-screen w-screen overflow-hidden">
      <div className="h-full w-full">
        {!isLoading && <Register onSubmit={registerUser} />}
        {isLoading && <Loader />}
        {showToast && (
          <div
            className={`telegraf-regular fixed left-1/2 top-10 -translate-x-1/2 transform rounded-lg bg-[#F5F5F5] px-6 py-3 text-center text-[2em] text-black shadow-lg transition-opacity duration-500 ${
              showToast ? "opacity-100" : "opacity-0"
            }`}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
