import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {
  onSave: (form: FormProps) => void;
}

interface FormProps {
  name: string;
  email: string;
  gender: string;
}

export default function Form({ onSave }: Props) {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      gender: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Email no válido")
        .required("El email es obligatorio"),
      gender: Yup.string()
        .oneOf(["men", "woman"], "Selecciona una opción válida")
        .required("El sexo es obligatorio"),
    }),
    onSubmit: (values) => {
      onSave(values);
    },
  });

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="top-[790px] font-bold mx-auto w-[65%] rounded-md text-[#382f2B]"
      >
        <h2 className=" font-bold text-[90px] text-center mb-[52px]">Regístrate</h2>
        <div className="mb-[40px]">
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
              border: `${formik.touched.name && formik.errors.name ? "2px solid red" : ""
                }`,
            }}
            className="input-ounline px-[61px] py-[23px]"
          />
        </div>

        <div className="mb-[52px]">
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
              border: `${formik.touched.email && formik.errors.email
                ? "2px solid red"
                : ""
                }`,
            }}
            className="input-ounline px-[61px] py-[23px]"
          />
        </div>

        <div className="mb-[20px] mt-[45px] flex flex-col items-start text-[50px]">
          <p className="">Selección de sexo:</p>
          <div className="flex ">

            <div className="flex justify-center items-center gap-[25px]  mr-[120px]">
              <input
                className=""
                type="radio"
                name="gender"
                id="men"
                value="men"
                onChange={formik.handleChange}
                checked={formik.values.gender === "men"}
              />
              <label htmlFor="men">Hombre</label>
            </div>
            <div className="flex justify-center items-center gap-[25px] appearance-none checked:bg-secundary  ">
              <input
                className=""
                type="radio"
                name="gender"
                id="woman"
                value="woman"
                onChange={formik.handleChange}
                checked={formik.values.gender === "woman"}
              />
              <label htmlFor="woman">Mujer</label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`btn-primary text-white mt-[90px]`}
        >
          Iniciar experiencia
        </button>
      </form>
    </>
  );
}

