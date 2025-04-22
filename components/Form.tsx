import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {
  onSave: (form: FormProps) => void;
}

interface FormProps {
  name: string;
  dni: string;
  gender: string;
  // termsSAP: boolean;
}

export default function Form({ onSave }: Props) {
  const formik = useFormik({
    initialValues: {
      name: "",
      dni: "",
      gender: "",
      // termsSAP: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("El nombre es obligatorio"),
      dni: Yup.string().required("La cedula es obligatoria"),
      gender: Yup.string().required("El genero es obligatorio"),
      // termsSAP: Yup.boolean(),
    }),
    onSubmit: (values) => {
      onSave(values);
    },
  });

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="absolute top-[790px] font-bold mx-auto w-[65%] rounded-md"
      >
        <div className="mb-[15px] relative">
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
              border: `${
                formik.touched.name && formik.errors.name ? "2px solid red" : ""
              }`,
            }}
            className=" mt-1 block text-black placeholder-[#cad3e5] bg-[#929bba] w-full text-[40px] h-[85px] p-[60px] border-[2px] border-white rounded-3xl"
          />
        </div>

        <div className="mb-[15px] relative">
          <input
            type="number"
            name="dni"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.dni}
            placeholder="Tu cedula"
            autoComplete="off"
            style={{
              caretColor: "black",
              border: `${
                formik.touched.dni && formik.errors.dni ? "2px solid red" : ""
              }`,
            }}
            className=" mt-1 block text-black placeholder-[#cad3e5] bg-[#929bba] w-full text-[40px] h-[85px] p-[60px] border-[2px] border-white rounded-3xl"
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
            onChange={(e) => {
              formik.setFieldValue("phone", e.target.value);
            }}
            onBlur={formik.handleBlur}
            value={formik.values.phone}
            placeholder="Celular"
            autoComplete="off"
            style={{
              caretColor: "black",
              border: `${
                formik.touched.phone && formik.errors.phone
                  ? "2px solid red"
                  : ""
              }`,
            }}
            className="mt-1 block text-[#cad3e5] placeholder-[#cad3e5] bg-[#929bba] w-full text-[40px] h-[85px] p-[60px] pl-[100px] border-[2px] border-white rounded-3xl"
          />
        </div> */}
        <div className="flex justify-around">
          <div className="mb-[20px] mt-[45px] flex items-start">
            <span className="text-white text-4xl ">Hombre</span>
            <input
              type="radio"
              name="gender"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value="hombre"
              // value={formik.values.gender ? "hombre" : ""}
              className="ml-[76px] mr-8 scale-checkbox accent-red-600"
            />
          </div>
          <div className="mb-[20px] mt-[45px] flex items-start">
            <span className="text-white text-4xl ">Mujer</span>
            <input
              type="radio"
              name="gender"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value="mujer"
              // value={formik.values.gender ? "mujer" : ""}
              className="ml-[76px] mr-8 scale-checkbox accent-red-600"
            />
          </div>
        </div>

        <button
          type="submit"
          className={`w-full h-[120px] text-[40px] mt-[150px] text-[#cad3e5] p-[30px] rounded-3xl `}
        ></button>
      </form>
    </>
  );
}
