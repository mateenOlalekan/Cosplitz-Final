import { create } from "zustand";

/* ---------------- PERSONAL INFO STORE ---------------- */
export const usePersonalInfo = create((set) => ({
  data: {
    firstName: "",
    lastName: "",
    email: "",
    nationality: "",
  },

  updateField: (field, value) =>
    set((state) => ({
      data: { ...state.data, [field]: value },
    })),

  reset: () =>
    set({
      data: {
        firstName: "",
        lastName: "",
        email: "",
        nationality: "",
      },
    }),
}));

/* ---------------- PROOF OF ADDRESS STORE ---------------- */
export const useProofOfAddress = create((set) => ({
  data: {
    city: "",
    district: "",
    fullAddress: "",
  },

  updateField: (field, value) =>
    set((state) => ({
      data: { ...state.data, [field]: value },
    })),

  reset: () =>
    set({
      data: {
        city: "",
        district: "",
        fullAddress: "",
      },
    }),
}));

/* ---------------- UPLOAD DOCUMENT STORE ---------------- */
export const useDocumentStore = create((set) => ({
  files: {
    driversId: null,
    passport: null,
    nationalId: null,
  },

  updateFile: (key, file) =>
    set((state) => ({
      files: { ...state.files, [key]: file },
    })),

  reset: () =>
    set({
      files: {
        driversId: null,
        passport: null,
        nationalId: null,
      },
    }),
}));
