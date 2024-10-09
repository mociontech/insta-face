import { create } from "zustand";

export const useUser = create((set) => ({
  user: { mail: "", gender: "" },
  setMail: (mail) =>
    set((state) => ({
      user: { ...state.user, mail: mail },
    })),
  setGender: (gender) =>
    set((state) => ({
      user: { ...state.user, gender: gender },
    })),
}));
