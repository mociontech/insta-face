import { create } from "zustand";

interface UsetState {
  user: string;
  userUrl: string;
  url: string;
  setUser: (user: string) => void;
  setUrl: (url: string) => void;
  setUserUrl: (userUrl: string) => void;
  logged: boolean;
  setLogged: (logged: boolean) => void;
}

export const useUser = create<UsetState>()((set) => ({
  user: "",
  url: "",
  userUrl: "",
  setUser: (user) => set({ user: user }),
  setUrl: (url) => set({ url: url }),
  setUserUrl: (userUrl) => set({ userUrl: userUrl }),
  logged: false,
  setLogged: (logged) => set({ logged: logged }),
}));
