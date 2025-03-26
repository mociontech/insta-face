"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Loader from "@/components/Loader";
import { configVariables } from "@/configVariables";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Register from "@/components/Register";
import { registerToFirebase } from "@/lib/db";

export default function RegisterExperiencePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const dataList = {
    nombre: {
      type: "text",
      value: "",
      imageRef: "",
      placeholder: "Tu Nombre",
    },
    correo: {
      type: "mail",
      value: "",
      imageRef: "",
      placeholder: "Tu Correo",
    },
    telefono: {
      type: "number",
      value: "",
      imageRef: "",
      placeholder: "Tu Teléfono",
    },
  };

  async function registerUser(form) {
    setIsLoading(true);
    const register = await registerToFirebase(
      form.nombre.value,
      form.correo.value,
      form.telefono.value
    );

    router.push("/camera");
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center">
            <h2 className="telegraf-bold flex justify-center items-center text-white text-[70px] text-center">
              ¡Registrate en la experiencia!
            </h2>
            <div className="telegraf-bold flex items-center text-[#DEF44B] text-[80px] gap-3 mb-10">
              <Register fields={dataList} onSubmit={registerUser} />
            </div>
          </div>
        </div>
        {isLoading && <Loader />}
        {showToast && (
          <div
            className={`telegraf-regular text-center fixed top-10 left-1/2 transform text-[2em] -translate-x-1/2 bg-[#F5F5F5] text-black px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500 ${
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
