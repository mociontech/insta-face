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
