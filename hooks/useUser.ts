import { create } from "zustand";

interface UsetState {
  user: User;
  url: string;
  setUser: (user: User) => void;
  setUrl: (url: string) => void;
  reset: () => void;
}

interface User {
  /** Cédula (identificador único; antes era el correo). */
  mail: string;
  /** Nombre oficial de la base de asistentes (o el que escribió quien se registró). */
  name?: string;
  /** Una por recorrido: evita duplicar el puntaje si el resultado se reenvía. */
  sessionId?: string;
  company?: string;
  phone?: string;
  idCode?: string;
  registrationMode?: "details" | "id";
}

export const useUser = create<UsetState>()((set) => ({
  user: { mail: "", name: "", sessionId: "" },
  url: "",
  setUser: (user) =>
    set((state) => ({
      user: { ...state.user, ...user },
    })),
  setUrl: (url) => set({ url: url }),
  reset: () => set({ user: { mail: "", name: "", sessionId: "", company: "", phone: "", idCode: "" }, url: "" }),
}));
