import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {
  onSave: (form: FormProps) => void;
}

interface FormProps {
  name: string;
  email: string;
}

export default function Form({ onSave }: Props) {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Email no válido")
        .required("El email es obligatorio"),
    }),
    onSubmit: (values) => {
      onSave(values);
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="top-[790px] font-bold mx-auto w-full rounded-md text-[#382f2B]"
    >
      <div className="mb-4">
        <input
          type="text"
          name="name"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          placeholder="Tu nombre"
          autoComplete="off"
          style={{
            caretColor: "black",
            border: formik.touched.name && formik.errors.name ? "2px solid red" : "",
          }}
          className="input-ounline"
        />
      </div>

      <div>
        <input
          type="email"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          placeholder="Tu correo"
          autoComplete="off"
          style={{
            caretColor: "black",
            border: formik.touched.email && formik.errors.email ? "2px solid red" : "",
          }}
          className="input-ounline"
        />
      </div>

      <button type="submit" className="btn-primary text-white mt-[90px]">
        Iniciar experiencia
      </button>
    </form>
  );
}
