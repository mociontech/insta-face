"use client";

import Link from "next/link";
import { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { artRect } from "@/lib/experience";
import { formatID, idDigits, normalizePhone, type RegistrationMode, type RegistrationValues } from "@/lib/registration";

export type FormProps = RegistrationValues;

export default function Form({ mode = "details", onSave }: {
  mode?: RegistrationMode;
  onSave: (values: FormProps) => void | Promise<void>;
}) {
  const first = useRef<HTMLInputElement>(null);
  const second = useRef<HTMLInputElement>(null);
  const formik = useFormik({
    initialValues: { name: "", company: "", email: "", phone: "", prefix: "", suffix: "" },
    validationSchema: mode === "id" ? Yup.object({
      prefix: Yup.string().matches(/^\d{3}$/, "Escribe los primeros tres digitos del ID.").required("Escribe tu ID."),
      suffix: Yup.string().matches(/^\d{3}$/, "Completa los ultimos tres digitos del ID.").required("Completa tu ID."),
    }) : Yup.object({
      name: Yup.string().trim().min(2, "Escribe tu nombre.").required("Escribe tu nombre."),
      company: Yup.string().trim().required("Escribe tu empresa."),
      email: Yup.string().trim().email("Revisa tu correo electronico.").required("Escribe tu correo electronico."),
      phone: Yup.string().test("phone", "El celular debe tener 10 digitos.", (value) => normalizePhone(value || "") !== "").required("Escribe tu celular."),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      try {
        await onSave({ mode, name: values.name.trim(), company: values.company.trim(), email: values.email.trim(), phone: normalizePhone(values.phone), idCode: mode === "id" ? formatID(values.prefix + values.suffix) : "" });
      } catch (failure) {
        // Errores del servidor (correo repetido, ID inexistente, sin conexion): se muestran en el aviso de la pantalla.
        helpers.setStatus(failure instanceof Error ? failure.message : "No pudimos continuar. Intentalo de nuevo.");
      }
    },
  });
  const error = (formik.status as string | undefined) || (formik.submitCount > 0 ? Object.values(formik.errors)[0] : null);

  function pasteID(event: React.ClipboardEvent<HTMLInputElement>) {
    const digits = idDigits(event.clipboardData.getData("text"));
    if (digits.length <= 3) return;
    event.preventDefault();
    void formik.setValues({ ...formik.values, prefix: digits.slice(0, 3), suffix: digits.slice(3, 6) });
    second.current?.focus();
  }

  return (
    <form onSubmit={formik.handleSubmit} className="absolute inset-0" noValidate>
      {mode === "details" ? <>
        {([
          { name: "name", label: "Tu nombre", top: 900, autoComplete: "name", type: "text" },
          { name: "company", label: "Tu empresa", top: 1032, autoComplete: "organization", type: "text" },
          { name: "phone", label: "Tu celular", top: 1164, autoComplete: "tel", type: "tel" },
          { name: "email", label: "Tu correo", top: 1296, autoComplete: "email", type: "email" },
        ] as const).map((field) => (
          <input key={field.name} name={field.name} aria-label={field.label} placeholder={field.label} type={field.type}
            autoComplete={field.autoComplete} value={formik.values[field.name]} onChange={formik.handleChange} onBlur={formik.handleBlur}
            aria-invalid={Boolean(formik.touched[field.name] && formik.errors[field.name])} aria-describedby={error ? "registration-error" : undefined}
            className="art-input" style={artRect(238, field.top, 700, 64)} />
        ))}
        <Link href="/registro-id" aria-label="digitar ID codigo" className="art-hit-area" style={artRect(320, 1710, 445, 85)}><span className="sr-only">digitar ID codigo</span></Link>
      </> : <>
        <input ref={first} name="prefix" aria-label="Primeros tres digitos del ID" inputMode="numeric" autoComplete="one-time-code" maxLength={3}
          placeholder="321" value={formik.values.prefix} onBlur={formik.handleBlur} onPaste={pasteID}
          onChange={(event) => { const value = idDigits(event.target.value).slice(0, 3); void formik.setFieldValue("prefix", value); if (value.length === 3) second.current?.focus(); }}
          className="art-input text-center" style={{ ...artRect(192, 1014, 288, 116), fontSize: "8.4cqw", fontWeight: 700 }} />
        <input ref={second} name="suffix" aria-label="Ultimos tres digitos del ID" inputMode="numeric" autoComplete="off" maxLength={3}
          placeholder="321" value={formik.values.suffix} onBlur={formik.handleBlur} onPaste={pasteID}
          onChange={(event) => void formik.setFieldValue("suffix", idDigits(event.target.value).slice(0, 3))}
          onKeyDown={(event) => { if (event.key === "Backspace" && !formik.values.suffix) first.current?.focus(); }}
          className="art-input text-center" style={{ ...artRect(576, 1014, 288, 116), fontSize: "8.4cqw", fontWeight: 700 }} />
        <Link href="/login" aria-label="Volver al registro" className="art-hit-area" style={artRect(860, 1680, 170, 135)}><span className="sr-only">Volver al registro</span></Link>
      </>}
      {error && <p id="registration-error" role="alert" className="art-notice" style={mode === "id" ? { top: "60.7%" } : undefined}>{error}</p>}
      <button type="submit" aria-label="Comenzar" disabled={formik.isSubmitting} className="art-hit-area" style={mode === "id" ? artRect(198, 1243, 684, 132) : artRect(198, 1543, 684, 134)}><span className="sr-only">Comenzar</span></button>
    </form>
  );
}
