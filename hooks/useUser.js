import { create } from "zustand";

export const useUser = create((set) => ({
  user: { mail: "", gender: "" },
  url: "",
  setMail: (mail) =>
    set((state) => ({
      user: { ...state.user, mail: mail },
    })),
  setUrl: (url) => set({ url: url }),
}));
