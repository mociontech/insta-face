export type RegistrationMode = "details" | "id";
export type RegistrationValues = {
  mode: RegistrationMode;
  name: string;
  company: string;
  email: string;
  phone: string;
  idCode: string;
};

export function idDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function formatID(value: string) {
  const digits = idDigits(value);
  return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
}

/**
 * Celular colombiano de 10 dígitos, tal como lo guarda la base de datos. Acepta espacios, guiones, paréntesis y el
 * prefijo +57 (se quita). Devuelve "" si no tiene 10 dígitos.
 */
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("57") ? digits.slice(2) : digits;
  return /^\d{10}$/.test(local) ? local : "";
}
