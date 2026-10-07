import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {
  onSave: (form: FormProps) => void;
}

interface FormProps {
  cedula: string;
  acceptedPolicy: boolean;
}

export default function Form({ onSave }: Props) {
  const formik = useFormik({
    initialValues: {
      cedula: "",
      acceptedPolicy: false,
    },
    validationSchema: Yup.object({
      cedula: Yup.string().required("La cedula es obligatoria"),
      acceptedPolicy: Yup.boolean().oneOf([true], "Debes aceptar la politica"),
    }),
    onSubmit: (values) => {
      onSave(values);
    },
  });

  const hasCedulaError = Boolean(formik.touched.cedula && formik.errors.cedula);
  const hasPolicyError = Boolean(formik.touched.acceptedPolicy && formik.errors.acceptedPolicy);
  const hasCedulaValue = formik.values.cedula.trim().length > 0;

  return (
    <form onSubmit={formik.handleSubmit} className="absolute inset-0 z-20">
      {hasCedulaValue && (
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
        name="cedula"
        inputMode="numeric"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.cedula}
        autoComplete="off"
        aria-label="Cedula"
        className="absolute bg-transparent font-bold text-[#08245a] outline-none"
        style={{
          border: hasCedulaError ? "3px solid #ff7300" : "0",
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

      <label
        className="absolute block cursor-pointer"
        style={{
          height: "2.25%",
          left: "11.15%",
          top: "58.55%",
          width: "4.4%",
        }}
      >
        <input
          type="checkbox"
          name="acceptedPolicy"
          checked={formik.values.acceptedPolicy}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          aria-label="Aceptar politica de privacidad"
          className="absolute inset-0 cursor-pointer opacity-0"
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
        }}
      >
        Comenzar
      </button>
    </form>
  );
}
