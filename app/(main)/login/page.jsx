"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../hooks/useUser";
import { register } from "../../../lib/db";

export default function LoginPage() {
  const router = useRouter();
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [genderInput, setGenderInput] = useState(""); // Nuevo estado para el género
  const [isLoading, setIsLoading] = useState(false);
  const { setGender, setMail } = useUser();

  async function submitForm() {
    try {
      // Checkea que ningun campo este vacio
      if (!nameInput || !emailInput || !genderInput)
        return alert("Por favor, completa todos los campos");

      setIsLoading(true);

      await register(nameInput, emailInput, genderInput);
      setGender(genderInput);
      setMail(emailInput);

      router.push("/camera");
    } catch (error) {
      console.log({ error: error });
    }
  }

  return (
    <div className="registro w-screen h-screen screen-bg flex flex-col pt-28 justify-center items-center px-16 relative overflow-hidden">
      {isLoading && (
        <div className="absolute z-50 h-screen w-screen flex justify-center items-center bg-black/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="48"
            viewBox="0 -960 960 960"
            width="500"
            className="animate-spin w-[150px] h-[150px]"
          >
            <path
              className="fill-white"
              d="M480-80q-84 0-157-31t-127-85q-54-54-85-127T80-480q0-84 31-157t85-127q54-54 127-85t157-31q12 0 21 9t9 21q0 12-9 21t-21 9q-141 0-240.5 99.5T140-480q0 141 99.5 240.5T480-140q141 0 240.5-99.5T820-480q0-12 9-21t21-9q12 0 21 9t9 21q0 84-31 157t-85 127q-54 54-127 85T480-80Z"
            />
          </svg>
        </div>
      )}
      <div className="flex flex-col gap-24 w-auto">
        <section className="flex flex-col gap-7 mt-[530px]">
          <div className="relative flex">
            <label htmlFor="name">
              <img
                src="/assets/name.svg"
                alt="Icono de una persona"
                className="absolute z-50 text-white/50 top-[36px] left-[68px]"
              />
            </label>
            <input
              type="text"
              id="name"
              value={nameInput}
              placeholder="Nombre"
              className="font-normal text-[40px] flex flex-1 h-[110px] w-[855px] pl-[138px] 
              text-white/50 bg-white/15 rounded-3xl border-[1.5px] border-white"
              autoComplete="off"
              onChange={(e) => {
                setNameInput(e.target.value);
              }}
            />
          </div>
          <div className="relative flex">
            <label htmlFor="email">
              <img
                src="/assets/email.svg"
                alt="Icono de una persona"
                className="absolute z-50 text-white/50 top-[36px] left-[56px]"
              />
            </label>
            <input
              type="email"
              id="email"
              value={emailInput}
              className="font-normal text-[40px] flex flex-1 h-[110px] w-[855px] pl-[138px]
              text-white/50 bg-white/15 rounded-3xl border-[1.5px] border-white"
              placeholder="Correo"
              autoComplete="off"
              onChange={(e) => {
                setEmailInput(e.target.value);
              }}
            />
          </div>
          {/* Sección para seleccionar el género */}
          <div className="flex gap-10">
            <label className="flex items-center gap-2 text-white text-[40px]">
              <input
                type="radio"
                value="male"
                checked={genderInput === "male"}
                onChange={(e) => setGenderInput(e.target.value)}
                className="h-8 w-8"
              />
              Hombre
            </label>
            <label className="flex items-center gap-2 text-white text-[40px]">
              <input
                type="radio"
                value="female"
                checked={genderInput === "female"}
                onChange={(e) => setGenderInput(e.target.value)}
                className="h-8 w-8"
              />
              Mujer
            </label>
          </div>
        </section>
        <button
          className="flex justify-center items-center text-3xl px-10 py-16 
        bg-[#F5006F] text-white h-[48px] text-center text-[50px] rounded-3xl"
          onClick={submitForm}
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
