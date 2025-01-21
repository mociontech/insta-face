import { create } from "zustand";

export const useUser = create((set) => ({
  user: { mail: "", gender: "" },
  url: "",
  setUser: (user) =>
    set((state) => ({
      user: { ...state.user, mail: user.mail, gender: user.gender },
    })),
  setUrl: (url) => set({ url: url }),
}));
