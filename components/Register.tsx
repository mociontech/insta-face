import { ChangeEvent, FormEvent, useMemo, useState } from "react";

interface RegisterFieldValue {
  value: string;
}

interface RegisterFormData {
  nombre: RegisterFieldValue;
  correo: RegisterFieldValue;
  sexo: RegisterFieldValue;
}

interface Props {
  onSubmit: (data: RegisterFormData) => void;
}

const initialFormData: RegisterFormData = {
  nombre: { value: "" },
  correo: { value: "" },
  sexo: { value: "" },
};

export default function Register({ onSubmit }: Props) {
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);

  const isReady = useMemo(() => {
    return (
      formData.nombre.value.trim() !== "" &&
      formData.correo.value.trim() !== "" &&
      formData.sexo.value.trim() !== ""
    );
  }, [formData]);

  function handleTextChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: { value },
    }));
  }

  function handleGenderChange(value: string) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      sexo: { value },
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isReady) {
      return;
    }

    onSubmit(formData);
    setFormData(initialFormData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="telegraf-regular relative h-full w-full text-white"
    >
      <div className="absolute left-1/2 top-[52.083333%] flex w-[79.166667%] -translate-x-1/2 flex-col gap-10">
        <label className="relative block">
          <img
            src="/name.svg"
            alt="Nombre"
            className="absolute left-[36px] top-1/2 h-[42px] w-[30px] -translate-y-1/2"
          />
          <input
            type="text"
            name="nombre"
            value={formData.nombre.value}
            onChange={handleTextChange}
            placeholder="Nombre"
            autoComplete="off"
            className="h-[110px] w-full rounded-[24px] border-[3px] border-white bg-white/10 pl-[135px] pr-10 text-[clamp(1.8rem,3vw,3.3rem)] text-white placeholder:text-white/70 focus:outline-none"
          />
        </label>

        <label className="relative block">
          <img
            src="/email.svg"
            alt="Correo"
            className="absolute left-[34px] top-1/2 h-[39px] w-[50px] -translate-y-1/2"
          />
          <input
            type="email"
            name="correo"
            value={formData.correo.value}
            onChange={handleTextChange}
            placeholder="Correo"
            autoComplete="off"
            className="h-[110px] w-full rounded-[24px] border-[3px] border-white bg-white/10 pl-[135px] pr-10 text-[clamp(1.8rem,3vw,3.3rem)] text-white placeholder:text-white/70 focus:outline-none"
          />
        </label>
      </div>

      <div className="absolute left-[10.648148%] top-[77.291667%] text-[clamp(1.8rem,3vw,3.2rem)] text-white">
        Selección de sexo
      </div>

      <div className="absolute left-[48.5%] top-[75.364583%] flex flex-col gap-6 text-[clamp(1.8rem,3vw,3.2rem)] text-white">
        <label className="flex cursor-pointer items-center gap-5">
          <input
            type="radio"
            name="sexo"
            value="Hombre"
            checked={formData.sexo.value === "Hombre"}
            onChange={() => handleGenderChange("Hombre")}
            className="h-[28px] w-[28px] accent-white"
          />
          <span>Hombre</span>
        </label>
        <label className="flex cursor-pointer items-center gap-5">
          <input
            type="radio"
            name="sexo"
            value="Mujer"
            checked={formData.sexo.value === "Mujer"}
            onChange={() => handleGenderChange("Mujer")}
            className="h-[28px] w-[28px] accent-white"
          />
          <span>Mujer</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!isReady}
        className={`telegraf-bold absolute left-[10.462963%] top-[89.479167%] h-[6.927083%] min-h-[72px] w-[79.166667%] rounded-[24px] text-[clamp(2.3rem,4vw,4.75rem)] uppercase text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition-opacity ${
          isReady ? "bg-black opacity-100" : "bg-black/70 opacity-70"
        }`}
      >
        Continuar
      </button>
    </form>
  );
}
