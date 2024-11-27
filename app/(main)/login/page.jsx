"use client";

import { useUser } from "@/hooks/useUser";
import { register } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { setGender, setMail } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    gender: "", // Añadir el campo de género
    termsSAP: false,
    termsMinsait: false,
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
    const isValid =
      formData.name !== "" &&
      formData.email !== "" &&
      formData.company !== "" &&
      formData.phone !== "" &&
      formData.gender !== "" && // Verificar que se haya seleccionado un género
      formData.termsSAP &&
      formData.termsMinsait;

    setIsValid(isValid);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    register(
      formData.name,
      formData.email,
      formData.gender,
      formData.company,
      formData.phone
    );

    console.log(formData);

    setGender(formData.gender);
    setMail(formData.email);

    nextPage();
  };

  function nextPage() {
    router.push("/camera");
  }

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      gender: "", // Reiniciar el campo de género
      termsSAP: false,
      termsMinsait: false,
    });
  }

  return (
    <div>
      <div className="login w-screen h-screen flex flex-col justify-start items-center relative">
        <form
          onSubmit={handleSubmit}
          className="absolute top-[540px] font72 font-bold mx-auto w-[78%] rounded-md"
        >
          <div className="mb-[70px] relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="NOMBRE"
              autoComplete="off"
              className="mt-1 block text-[#021347] w-full text-center text-3xl h-[85px] p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-[65px] relative">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full text-center text-[#021347] text-3xl p-2 border h-[85px] border-gray-300 rounded-md"
            >
              <option value="" disabled>
                SELECCIONA GÉNERO
              </option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>

          <div className="mb-[70px] relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="CORREO CORPORATIVO"
              autoComplete="off"
              className="mt-1 block w-full text-[#021347] text-center text-3xl p-2 border h-[85px] border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-[70px] relative">
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="EMPRESA"
              autoComplete="off"
              className="mt-1 block w-full text-[#021347] text-center text-3xl p-2 border h-[85px] bg-white border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-[16px] relative">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="CELULAR"
              autoComplete="off"
              className="mt-1 block w-full text-[#021347] text-center text-3xl p-2 border h-[85px] border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-[20px] mt-[89px] flex items-start">
            <input
              type="checkbox"
              name="termsSAP"
              checked={formData.termsSAP}
              onChange={handleInputChange}
              className="ml-[23px] mr-8 scale-checkbox"
            />
            <a
              href="https://www.sap.com/latinamerica/about/legal/privacy.html"
              target="_blank"
              rel="noreferrer noopener"
              className="w-full bg-transparent h-[45px]"
            ></a>
          </div>

          <div className="mt-[80px] flex items-start">
            <input
              type="checkbox"
              name="termsMinsait"
              checked={formData.termsMinsait}
              onChange={handleInputChange}
              className="ml-[23px] mr-8 scale-checkbox"
            />
            <a
              href="https://www.softtek.com/es/aviso-privacidad"
              target="_blank"
              rel="noreferrer noopener"
              className="w-full bg-transparent h-[45px]"
            ></a>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full text-3xl mt-[90px] text-white h-[85px] py-2 px-4 rounded-md ${
              isValid ? "bg-[#001449]" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Comenzar
          </button>
        </form>
      </div>
    </div>
  );
}
