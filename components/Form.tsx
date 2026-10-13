import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const POLICY_PDF_URL = "/ENRUTA/Autorizacion_Tratamiento_Datos_EnRuta_Cartagena.pdf";

type RegisterMode = "cedula" | "nombre";

interface Props {
  onSave: (form: FormProps) => void;
}

export interface FormProps {
  cedula: string;
  nombre: string;
  acceptedPolicy: boolean;
  mode: RegisterMode;
}

export default function Form({ onSave }: Props) {
  const [mode, setMode] = useState<RegisterMode>("cedula");
  const [hasOpenedPolicy, setHasOpenedPolicy] = useState(false);

  const formik = useFormik({
    initialValues: {
      cedula: "",
      nombre: "",
      acceptedPolicy: false,
    },
    validationSchema: Yup.object({
      cedula: Yup.string().when([], {
        is: () => mode === "cedula",
        then: (schema) => schema.required("La cedula es obligatoria"),
        otherwise: (schema) => schema,
      }),
      nombre: Yup.string().when([], {
        is: () => mode === "nombre",
        then: (schema) => schema.required("El nombre es obligatorio"),
        otherwise: (schema) => schema,
      }),
      acceptedPolicy: Yup.boolean().oneOf([true], "Debes aceptar la politica"),
    }),
    onSubmit: (values) => {
      onSave({ ...values, mode });
    },
  });

  const activeField = mode === "cedula" ? "cedula" : "nombre";
  const activeValue = formik.values[activeField].trim();
  const hasActiveValue = activeValue.length > 0;
  const hasFieldError = Boolean(
    mode === "cedula"
      ? formik.touched.cedula && formik.errors.cedula
      : formik.touched.nombre && formik.errors.nombre
  );
  const hasPolicyError = Boolean(formik.touched.acceptedPolicy && formik.errors.acceptedPolicy);
  const shouldCoverFieldLabel = mode === "nombre" || hasActiveValue;

  function openPolicy() {
    setHasOpenedPolicy(true);
    window.open(POLICY_PDF_URL, "_blank", "noopener,noreferrer");
  }

  function switchToNameRegistration() {
    setMode("nombre");
    formik.setFieldValue("acceptedPolicy", false);
    setHasOpenedPolicy(false);
  }

  return (
    <form onSubmit={formik.handleSubmit} className="absolute inset-0 z-20">
      {shouldCoverFieldLabel && (
        <span
          aria-hidden="true"
          className="absolute bg-white"
          style={{
            borderRadius: "0 30px 30px 0",
            height: "5.15%",
            left: "21.6%",
            pointerEvents: "none",
            top: "49.65%",
            width: "48%",
            zIndex: 1,
          }}
        />
      )}

      <input
        type="text"
        name={activeField}
        inputMode={mode === "cedula" ? "numeric" : "text"}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[activeField]}
        placeholder={mode === "nombre" ? "Nombre" : ""}
        autoComplete="off"
        aria-label={mode === "cedula" ? "Cedula" : "Nombre"}
        className="absolute bg-transparent font-bold text-[#08245a] outline-none placeholder:text-[#08245a]"
        style={{
          border: hasFieldError ? "3px solid #ff7300" : "0",
          borderRadius: "34px",
          fontSize: "clamp(22px, 4.2vw, 42px)",
          height: "5.15%",
          left: "9.1%",
          paddingLeft: "clamp(72px, 13vw, 150px)",
          top: "49.65%",
          width: "81.8%",
          zIndex: 2,
        }}
      />

      <button
        type="button"
        aria-label="Abrir politica de privacidad"
        className="absolute bg-transparent text-transparent"
        style={{
          height: "2.7%",
          left: "45.1%",
          top: "58.65%",
          width: "32.5%",
          zIndex: 4,
        }}
        onClick={openPolicy}
      >
        Politica de Privacidad
      </button>

      <label
        className="absolute block"
        style={{
          cursor: hasOpenedPolicy ? "pointer" : "not-allowed",
          height: "2.25%",
          left: "11.15%",
          opacity: hasOpenedPolicy ? 1 : 0.55,
          top: "58.55%",
          width: "4.4%",
          zIndex: 3,
        }}
      >
        <input
          type="checkbox"
          name="acceptedPolicy"
          checked={formik.values.acceptedPolicy}
          disabled={!hasOpenedPolicy}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-label="Aceptar politica de privacidad"
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        {formik.values.acceptedPolicy && (
          <span
            className="absolute inset-0 rounded-[4px]"
            style={{
              background: "#ff7300",
              boxShadow: "inset 0 0 0 4px #ffffff",
            }}
          />
        )}
        {hasPolicyError && (
          <span
            className="absolute -inset-1 rounded-[6px]"
            style={{ border: "3px solid #ff7300" }}
          />
        )}
      </label>

      <button
        type="submit"
        aria-label="Comenzar"
        className="absolute rounded-full bg-transparent text-transparent"
        style={{
          height: "6.95%",
          left: "18.3%",
          top: "64.95%",
          width: "63.4%",
          zIndex: 3,
        }}
      >
        Comenzar
      </button>

      <button
        type="button"
        aria-label="Registrate con nombre"
        className="absolute bg-transparent text-transparent"
        style={{
          height: "4.4%",
          left: "35.5%",
          top: "81.8%",
          width: "29%",
          zIndex: 3,
        }}
        onClick={switchToNameRegistration}
      >
        Registrate
      </button>
    </form>
  );
}
