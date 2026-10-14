import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

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
  const [showPolicy, setShowPolicy] = useState(false);

  const formik = useFormik({
    initialValues: {
      cedula: "",
      nombre: "",
      acceptedPolicy: false,
    },
    validationSchema: Yup.object({
      cedula: Yup.string().when([], {
        is: () => mode === "cedula" || mode === "nombre",
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
  const registerCedulaError = Boolean(formik.touched.cedula && formik.errors.cedula);
  const registerNombreError = Boolean(formik.touched.nombre && formik.errors.nombre);

  function openPolicy() {
    setShowPolicy(true);
  }

  function acceptPolicy() {
    setHasOpenedPolicy(true);
    setShowPolicy(false);
    formik.setFieldValue("acceptedPolicy", true);
  }

  function switchToNameRegistration() {
    setMode("nombre");
    formik.setFieldValue("acceptedPolicy", false);
    setHasOpenedPolicy(false);
  }

  return (
    <form onSubmit={formik.handleSubmit} className="absolute inset-0 z-20">
      {showPolicy && (
        <div className="absolute inset-0 z-50 flex flex-col items-center bg-[#06194d] px-[7.2%] py-[4.6%] text-white">
          <h1 className="mb-[3.4%] text-center text-[clamp(26px,5.6vw,58px)] font-extrabold leading-none">
            Politica de privacidad
          </h1>

          <section className="w-full flex-1 rounded-[14px] border-[6px] border-[#f0f3fb] bg-[#071b56] p-[3.2%] shadow-[0_0_0_2px_rgba(255,255,255,0.22)]">
            <div className="relative h-full w-full overflow-hidden rounded-[6px] bg-[#071b56] px-[10%] pb-[9%] pt-[7%]">
              <img
                src="/ENRUTA/imagen2.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
              />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-[7%] flex items-center justify-center gap-[6%]">
                  <span className="text-[clamp(34px,7vw,72px)] font-extrabold tracking-tight text-white">
                    En<span className="text-[#ff7300]">Ruta</span>
                  </span>
                  <span className="h-[clamp(46px,9vw,88px)] w-px bg-white/70" />
                  <span className="max-w-[30%] text-center text-[clamp(8px,1.65vw,18px)] font-bold uppercase leading-tight text-white">
                    Camara Comercio Cartagena
                  </span>
                </div>

                <h2 className="mb-[7%] text-center text-[clamp(22px,5.2vw,54px)] font-extrabold uppercase leading-tight text-[#ff7300]">
                  Autorizacion para el tratamiento de datos personales
                </h2>

                <div className="mx-auto max-w-[78%] space-y-[3.8%] text-left text-[clamp(12px,2.35vw,25px)] font-bold leading-[1.36] text-white">
                  <p>
                    Autorizo de manera libre, previa, expresa e informada a la
                    Camara de Comercio de Cartagena, como responsable del
                    tratamiento, para recolectar, almacenar y utilizar los datos
                    personales suministrados en este formulario con el fin de
                    gestionar mi registro y participacion en Enruta Empresarial.
                  </p>
                  <p>
                    El tratamiento se realizara conforme a la Ley 1581 de 2012,
                    sus normas reglamentarias y la Politica de Proteccion de
                    Datos Personales de la entidad.
                  </p>
                  <p>
                    Como titular, tengo derecho a conocer, actualizar y
                    rectificar mis datos; solicitar prueba de esta autorizacion;
                    presentar quejas ante la Superintendencia de Industria y
                    Comercio; y solicitar la supresion o revocatoria cuando
                    legalmente proceda.
                  </p>
                  <p>
                    Puedo consultar la politica y el aviso de privacidad en
                    Proteccion de Datos Personales.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <button
            type="button"
            className="mt-[3.2%] h-[6.8%] min-h-[58px] w-[67%] rounded-full bg-[#ff7300] text-[clamp(24px,5vw,52px)] font-extrabold leading-none text-white"
            onClick={acceptPolicy}
          >
            Aceptar
          </button>
        </div>
      )}

      {mode === "nombre" ? (
        <div className="absolute inset-0 z-20 overflow-hidden bg-[#06194d] px-[8%] pt-[5.6%] text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                "repeating-linear-gradient(28deg, transparent 0 13%, rgba(48,112,255,0.38) 13.3% 13.8%, transparent 14.2% 28%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[7.7%] left-[-12%] h-[9%] w-[124%] rounded-[50%] border-t-[16px] border-[#ff7300]"
          />

          <div className="relative z-10 flex items-center justify-center gap-[5.6%]">
            <span className="text-[clamp(42px,10vw,92px)] font-extrabold tracking-tight text-white">
              En<span className="text-[#ff7300]">Ruta</span>
            </span>
            <span className="h-[clamp(58px,12vw,108px)] w-px bg-white/75" />
            <span className="max-w-[24%] text-center text-[clamp(8px,1.9vw,18px)] font-bold uppercase leading-tight text-white">
              Camara Comercio Cartagena
            </span>
          </div>

          <h1 className="relative z-10 mt-[12%] text-center text-[clamp(36px,8.8vw,84px)] font-extrabold uppercase leading-none text-[#ff7300]">
            Registrate
          </h1>

          <div className="relative z-10 mt-[7%] space-y-[3.5%]">
            <label className="relative block">
              <span className="absolute left-[5.5%] top-1/2 h-[32%] w-[4.6%] -translate-y-1/2 rounded-full border-[3px] border-[#08245a]" />
              <input
                type="text"
                name="cedula"
                inputMode="numeric"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.cedula}
                placeholder="Cedula"
                autoComplete="off"
                aria-label="Cedula"
                className="h-[clamp(56px,7vh,96px)] w-full rounded-[18px] bg-white pl-[14.8%] pr-[5%] text-[clamp(24px,5vw,48px)] font-medium text-[#08245a] outline-none placeholder:text-[#7d8cac]"
                style={{
                  border: registerCedulaError ? "4px solid #ff7300" : "0",
                }}
              />
            </label>

            <label className="relative block">
              <span className="absolute left-[5.5%] top-1/2 h-[32%] w-[4.6%] -translate-y-1/2 rounded-full border-[3px] border-[#08245a]" />
              <input
                type="text"
                name="nombre"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nombre}
                placeholder="Nombre completo"
                autoComplete="off"
                aria-label="Nombre completo"
                className="h-[clamp(56px,7vh,96px)] w-full rounded-[18px] bg-white pl-[14.8%] pr-[5%] text-[clamp(24px,5vw,48px)] font-medium text-[#08245a] outline-none placeholder:text-[#7d8cac]"
                style={{
                  border: registerNombreError ? "4px solid #ff7300" : "0",
                }}
              />
            </label>
          </div>

          <div className="relative z-10 mt-[5%] flex items-start gap-[3.8%]">
            <label
              className="relative mt-[0.9%] block h-[clamp(28px,5.4vw,52px)] w-[clamp(28px,5.4vw,52px)] shrink-0 rounded-[5px] border-[4px] border-white"
              style={{
                cursor: hasOpenedPolicy ? "pointer" : "not-allowed",
                opacity: hasOpenedPolicy ? 1 : 0.55,
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
                <span className="absolute inset-[15%] rounded-[3px] bg-[#ff7300]" />
              )}
              {hasPolicyError && (
                <span className="absolute -inset-2 rounded-[8px] border-[3px] border-[#ff7300]" />
              )}
            </label>

            <p className="text-[clamp(16px,3.1vw,34px)] font-extrabold leading-[1.16] text-white">
              Autorizo el tratamiento de mis datos personales (cedula y nombre)
              para participar en las experiencias del evento y asociar mi
              puntaje.{" "}
              <button
                type="button"
                className="font-extrabold text-[#ff7300] underline"
                onClick={openPolicy}
              >
                Politica de Privacidad.
              </button>
            </p>
          </div>

          <button
            type="submit"
            className="relative z-10 mx-auto mt-[8%] block h-[clamp(64px,8vh,110px)] w-[79%] rounded-full bg-[#ff7300] text-[clamp(28px,6vw,62px)] font-extrabold leading-none text-white"
          >
            Continuar
          </button>
        </div>
      ) : (
        <>
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
        inputMode="numeric"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[activeField]}
        placeholder=""
        autoComplete="off"
        aria-label="Cedula"
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
        </>
      )}
    </form>
  );
}
