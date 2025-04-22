import { create } from "zustand";

interface UsetState {
  user: User;
  url: string;
  setUser: (user: User) => void;
  setUrl: (url: string) => void;
}

interface User {
  dni: string;
}

export const useUser = create<UsetState>()((set) => ({
  user: { dni: "" },
  url: "",
  setUser: (user) =>
    set((state) => ({
      user: { ...state.user, dni: user.dni },
    })),
  setUrl: (url) => set({ url: url }),
}));
