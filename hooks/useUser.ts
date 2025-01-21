import { create } from "zustand";

interface UsetState {
  user: User;
  url: string;
  setUser: (user: User) => void;
  setUrl: (url: string) => void;
}

interface User {
  mail: string;
  gender: string;
}

export const useUser = create<UsetState>()((set) => ({
  user: { mail: "", gender: "" },
  url: "",
  setUser: (user) =>
    set((state) => ({
      user: { ...state.user, mail: user.mail, gender: user.gender },
    })),
  setUrl: (url) => set({ url: url }),
}));
