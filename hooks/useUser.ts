import { create } from "zustand";

interface UsetState {
  user: User;
  url: string;
  setUser: (user: User) => void;
  setUrl: (url: string) => void;
  logged: boolean;
  setLogged: (logged: boolean) => void;
}

interface User {
  mail: string;
  code: string;
}

export const useUser = create<UsetState>()((set) => ({
  user: { mail: "", code: "" },
  url: "",
  setUser: (user) =>
    set((state) => ({
      user: {
        ...state.user,
        mail: user.mail,
        code: user.code,
      },
    })),
  setUrl: (url) => set({ url: url }),
  logged: false,
  setLogged: (logged) => set({ logged: logged }),
}));
