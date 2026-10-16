import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

type RegisterMode = "cedula" | "nombre";

interface Props {
  onSave: (form: FormProps) => void | Promise<void>;
  /** Mensaje de la validación (p. ej. "no te encontramos"). */
  notice?: string | null;
  /** true: pasa a la pantalla de registro con nombre. */
  forceRegister?: boolean;
}

export interface FormProps {
  cedula: string;
  nombre: string;
  acceptedPolicy: boolean;
  mode: RegisterMode;
}

function NetworkBackground({
  soft = false,
  arc = true,
}: {
  soft?: boolean;
  arc?: boolean;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #082268 0%, #07184f 48%, #061444 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(30deg, transparent 0 15.5%, rgba(37,104,255,0.42) 15.8% 16.35%, transparent 16.7% 33%), repeating-linear-gradient(150deg, transparent 0 19%, rgba(41,112,255,0.28) 19.2% 19.7%, transparent 20% 37%)",
          opacity: soft ? 0.32 : 0.54,
        }}
      />
      {arc && (
        <div
          aria-hidden="true"
          className="absolute -bottom-[1.5%] left-[-12%] h-[10%] w-[126%] rounded-[50%] border-t-[16px] border-[#ff7300]"
        />
      )}
    </>
  );
}

function EnrutaLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/ENRUTA/logo.png"
      alt="EnRuta Empresarial"
      className={`pointer-events-none select-none object-contain ${className}`}
    />
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    >
      <circle cx="12" cy="7.6" r="3.1" />
      <path d="M5.5 20c0-4.1 2.8-6.7 6.5-6.7s6.5 2.6 6.5 6.7" />
    </svg>
  );
}

function PolicyScreen({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-[#06194d] text-white">

      <h1 className="absolute left-0 top-[3.45%] z-10 w-full text-center text-[clamp(28px,5.75vw,60px)] font-extrabold leading-none">
        Política de privacidad
      </h1>

      <section className="absolute left-[7.6%] top-[8.05%] z-10 h-[80.75%] w-[84.8%] overflow-hidden rounded-[15px] bg-[#eef2fb] p-[2.8%]">
        <div className="relative h-full w-full overflow-hidden rounded-[5px] bg-[#07194f]">
          <NetworkBackground soft arc />

          <EnrutaLogo className="absolute left-[10.6%] top-[4.6%] z-10 h-auto w-[78.5%]" />

          <h2 className="absolute left-[10%] top-[17.1%] z-10 w-[80%] text-center text-[clamp(22px,5vw,52px)] font-extrabold uppercase leading-[1.08] text-[#ff7300]">
            Autorización para el tratamiento de datos personales
          </h2>

          <div className="absolute left-[11.7%] top-[33.2%] z-10 w-[76.6%] space-y-[3.1%] text-[clamp(11px,2.05vw,22px)] font-bold leading-[1.36] text-white">
            <p>
              Autorizo de manera libre, previa, expresa e informada a la Cámara de
              Comercio de Cartagena, como responsable del tratamiento, para
              recolectar, almacenar y utilizar los datos personales suministrados
              en este formulario con el fin de gestionar mi registro y
              participación en Enruta Empresarial, realizar seguimiento a mi
              experiencia y enviarme información sobre Enruta y otros programas,
              servicios, eventos y actividades de la Cámara de Comercio de
              Cartagena, a través de los medios de contacto suministrados.
            </p>
            <p>
              El tratamiento se realizará conforme a la Ley 1581 de 2012, sus
              normas reglamentarias y la Política de Protección de Datos
              Personales de la entidad.
            </p>
            <p>
              Como titular, tengo derecho a conocer, actualizar y rectificar mis
              datos; acceder gratuitamente a ellos; solicitar prueba de esta
              autorización; conocer el uso de mi información; presentar quejas
              ante la Superintendencia de Industria y Comercio; y solicitar la
              supresión de mis datos o revocar la autorización cuando legalmente
              proceda.
            </p>
            <p>
              Puedo consultar la política y el aviso de privacidad en Protección
              de Datos Personales.
            </p>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="absolute bottom-[3.1%] left-[20.4%] z-10 h-[6.75%] w-[59.2%] rounded-full bg-[#ff7300] text-[clamp(25px,5.25vw,56px)] font-extrabold leading-none text-white"
        onClick={onAccept}
      >
        Aceptar
      </button>
    </div>
  );
}

export default function Form({ onSave, notice, forceRegister }: Props) {
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
        then: (schema) =>
          schema.required("La cedula es obligatoria").matches(/^\d{5,12}$/, "La cedula debe tener entre 5 y 12 numeros"),
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

  // La cédula son solo dígitos, hasta 12 (igual que en la pared y el tríptico).
  const onCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    formik.setFieldValue("cedula", e.target.value.replace(/\D/g, "").slice(0, 12));
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

  useEffect(() => {
    if (forceRegister) switchToNameRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceRegister]);

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
      {showPolicy && <PolicyScreen onAccept={acceptPolicy} />}

      {notice && !showPolicy && (
        <p className="pointer-events-none absolute left-[6%] top-[2.2%] z-40 w-[88%] rounded-[14px] bg-[#ff7300] px-4 py-3 text-center text-[clamp(15px,3.2vw,34px)] font-extrabold leading-tight text-white">
          {notice}
        </p>
      )}

      {mode === "nombre" ? (
        <div className="absolute inset-0 z-20 overflow-hidden bg-[#06194d] text-white">
          <NetworkBackground />

          <EnrutaLogo className="absolute left-[8.8%] top-[4.7%] z-10 h-auto w-[82.4%]" />

          <h1 className="absolute left-0 top-[18.6%] z-10 w-full text-center text-[clamp(39px,8.9vw,90px)] font-extrabold uppercase leading-none text-[#ff7300]">
            REGÍSTRATE
          </h1>

          <label className="absolute left-[8.2%] top-[26.55%] z-10 block h-[6.35%] w-[83.6%]">
            <UserIcon className="absolute left-[4.8%] top-1/2 h-[46%] w-[6.8%] -translate-y-1/2 text-[#08245a]" />
            <input
              type="text"
              name="cedula"
              inputMode="numeric"
              maxLength={12}
              onChange={onCedulaChange}
              onBlur={formik.handleBlur}
              value={formik.values.cedula}
              placeholder="Cédula"
              autoComplete="off"
              aria-label="Cedula"
              className="h-full w-full rounded-[18px] bg-white pl-[14.1%] pr-[5%] text-[clamp(24px,4.8vw,48px)] font-normal text-[#08245a] outline-none placeholder:text-[#7d8cac]"
              style={{
                border: registerCedulaError ? "4px solid #ff7300" : "0",
              }}
            />
          </label>

          <label className="absolute left-[8.2%] top-[34.6%] z-10 block h-[6.35%] w-[83.6%]">
            <UserIcon className="absolute left-[4.8%] top-1/2 h-[46%] w-[6.8%] -translate-y-1/2 text-[#08245a]" />
            <input
              type="text"
              name="nombre"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.nombre}
              placeholder="Nombre completo"
              autoComplete="off"
              aria-label="Nombre completo"
              className="h-full w-full rounded-[18px] bg-white pl-[14.1%] pr-[5%] text-[clamp(24px,4.8vw,48px)] font-normal text-[#08245a] outline-none placeholder:text-[#7d8cac]"
              style={{
                border: registerNombreError ? "4px solid #ff7300" : "0",
              }}
            />
          </label>

          <label
            className="absolute left-[8.4%] top-[43.25%] z-10 block h-[3.15%] w-[6.05%] rounded-[4px] border-[4px] border-white"
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
              <span className="absolute inset-0 rounded-[2px] bg-[#ff7300]">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="absolute left-[12%] top-[13%] h-[74%] w-[82%] text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.5"
                >
                  <path d="M4 12.5l5.2 5.2L20.5 5.5" />
                </svg>
              </span>
            )}
            {hasPolicyError && (
              <span className="absolute -inset-2 rounded-[8px] border-[3px] border-[#ff7300]" />
            )}
          </label>

          <p className="absolute left-[16.6%] top-[42.9%] z-10 w-[75.2%] text-[clamp(15px,3.05vw,33px)] font-extrabold leading-[1.14] text-white">
            Autorizo el tratamiento de mis datos personales (cédula y nombre)
            para participar en las experiencias del evento y asociar mi
            puntaje.{" "}
            <button
              type="button"
              className="font-extrabold text-[#ff7300] underline decoration-[2px] underline-offset-[2px]"
              onClick={openPolicy}
            >
              Política de Privacidad.
            </button>
          </p>

          <button
            type="submit"
            className="absolute left-[16.6%] top-[55.55%] z-10 h-[7.1%] w-[66.8%] rounded-full bg-[#ff7300] text-[clamp(27px,5.75vw,60px)] font-extrabold leading-none text-white"
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
            maxLength={activeField === "cedula" ? 12 : 120}
            onChange={activeField === "cedula" ? onCedulaChange : formik.handleChange}
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
