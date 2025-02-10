import { create } from "zustand";

interface UsetState {
  user: User;
  url: string;
  setUser: (user: User) => void;
  setUrl: (url: string) => void;
  score: number;
  code: string;
  logged: boolean;
  setCode: (code: string) => void;
  setScore: (score: number) => void;
  setLogged: (logged: boolean) => void;
}

interface User {
  mail: string;
}

export const useUser = create<UsetState>()((set) => ({
  user: { mail: "", gender: "" },
  url: "",
  setUser: (user) =>
    set((state) => ({
      user: { ...state.user, mail: user.mail },
    })),
  setUrl: (url) => set({ url: url }),
  score: 0,
  code: "",
  logged: false,
  setCode: (code) => set({ code }),
  setLogged: (logged) => set({ logged: logged }),
  setScore: (score) => set({ score }),
}));
