"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    termsSAP: false,
  });

  const [isValid, setIsValid] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  useEffect(() => {
    // Validación del formulario: verificar si todos los campos están completos y los términos aceptados
    const isValid = formData.name !== "" && formData.email !== "";
    //formData.phone !== "" &&
    //formData.gender !== "" &&
    //formData.termsSAP;
    setIsValid(isValid);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    register(formData.name, formData.email, formData.phone, formData.gender);

    console.log(formData);

    setUser({ mail: formData.email, gender: formData.gender });

    nextPage();
  };

  function nextPage() {
    router.push("/camera");
  }

  return (
    <div>
      <div className="login w-screen h-screen flex flex-col justify-start items-center relative">
        <form
          onSubmit={handleSubmit}
          className="absolute top-[790px] font-bold mx-auto w-[65%] rounded-md"
        >
          <h1
            className="text-white text-[70px] text-center"
            style={{
              marginBottom: "1em",
              fontFamily: "FormaDJRBanner-ExtraBold-Testing",
              fontWeight: "bold",
            }}
          >
            REGISTRO
          </h1>
          <div className="mb-[15px] relative">
            <img
              src="/name.svg"
              alt="name icon"
              className="absolute top-[35px] left-10 w-10"
            />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nombre"
              autoComplete="off"
              style={{
                fontFamily: "FormaDJRDisplay-Regular",
                fontWeight: "lighter",
              }}
              className="mt-1 block text-[#000000] placeholder-[#000000] bg-[#929bba] w-full text-[40px] h-[85px] p-[60px] pl-[100px] border-[2px] border-white rounded-3xl"
            />
          </div>

          <div className="mb-[15px] relative">
            <img
              src="/email.svg"
              alt="name icon"
              className="absolute top-[43px] left-[35px] w-15 pr-5"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Correo"
              autoComplete="off"
              style={{
                fontFamily: "FormaDJRDisplay-Regular",
                fontWeight: "lighter",
              }}
              className="mt-1 block text-[#000000] placeholder-[#000000] bg-[#929bba] w-full text-[40px] h-[85px] p-[60px] pl-[100px] border-[2px] border-white rounded-3xl"
            />
          </div>

          {/* <div className="mb-[16px] relative">
            <img
              src="/phone.png"
              alt="name icon"
              className="absolute top-[25px] left-[35px] w-12"
            />
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Celular"
              autoComplete="off"
              className="mt-1 block text-[#cad3e5] placeholder-[#cad3e5] bg-[#929bba] w-full text-[40px] h-[85px] p-[60px] pl-[100px] border-[2px] border-white rounded-3xl"
            />
          </div> */}

          {/* <div className="mb-[20px] mt-[45px] flex items-start">
            <input
              type="checkbox"
              name="termsSAP"
              checked={formData.termsSAP}
              onChange={handleInputChange}
              className="ml-[76px] mr-8 scale-checkbox"
            />
            <a
              href="https://www.sap.com/latinamerica/about/legal/privacy.html"
              target="_blank"
              rel="noreferrer noopener"
              className="w-full bg-transparent h-[45px]"
            ></a>
          </div> */}

          {/* <div className="flex justify-around">
            <div className="mb-[16px] flex items-center">
              <input
                id="hombre"
                type="radio"
                name="gender"
                value="0"
                onChange={handleInputChange}
                className="mr-2 mt-1 block text-[#cad3e5] placeholder-[#cad3e5] bg-[#929bba] w-10 text-[40px] h-[85px] p-[60px] pl-[100px] border-[2px] border-white rounded-3xl"
              />
              <label className="text-[40px] text-[#cad3e5]" htmlFor="hombre">Hombre</label>
            </div>
            <div className="mb-[16px] relative flex items-center">
              <input
                id="mujer"
                type="radio"
                name="gender"
                value="1"
                onChange={handleInputChange}
                className="mr-2 mt-1 block text-[#cad3e5] placeholder-[#cad3e5] bg-[#929bba] w-10 text-[40px] h-[85px] p-[60px] pl-[100px] border-[2px] border-white rounded-3xl"
              />
              <label className="text-[40px] text-[#cad3e5]" htmlFor="mujer">Mujer</label>
            </div>
          </div> */}

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full text-[50px] mt-[90px] text-[#ffffff] p-[30px] rounded-3xl ${
              isValid ? "bg-[#0088cc]" : "bg-[#0088cc] cursor-not-allowed"
            }`}
          >
            Comenzar
          </button>
        </form>
      </div>
    </div>
  );
}
