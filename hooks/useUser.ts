import { create } from "zustand";

interface UsetState {
  gender: string;
  user: string;
  userUrl: string;
  url: string;
  setGender: (gender: string) => void;
  setUser: (user: string) => void;
  setUrl: (url: string) => void;
  setUserUrl: (userUrl: string) => void;
  logged: boolean;
  setLogged: (logged: boolean) => void;
}

export const useUser = create<UsetState>()((set) => ({
  gender: "",
  user: "",
  url: "",
  userUrl: "",
  setGender: (gender) => set({ gender: gender }),
  setUser: (user) => set({ user: user }),
  setUrl: (url) => set({ url: url }),
  setUserUrl: (userUrl) => set({ userUrl: userUrl }),
  logged: false,
  setLogged: (logged) => set({ logged: logged }),
}));
