/* src/store/kycStore.js – unified, auth-aware, debugged */
import { create } from 'zustand';
import { authService } from "../services/authApi";
import { useAuthStore } from "./authStore";

/* ---------- small helpers ---------- */
const INITIAL_PERSONAL = {
  firstName: "",
  lastName: "",
  email: "",
  nationality: "",
};

const INITIAL_ADDRESS = {
  city: "",
  district: "",
  fullAddress: "",
};

const INITIAL_FILES = {
  passport: null,
  nationalId: null,
  driversId: null,
};

/* ============================================================
 * STORE
 * ============================================================ */
export const useKycStore = create((set, get) => ({
  /* ---------- state ---------- */
  personal: { ...INITIAL_PERSONAL },
  address:  { ...INITIAL_ADDRESS },
  files:    { ...INITIAL_FILES },
  isLoading: false,
  error: null,
  success: false,

  /* ---------- internal helpers ---------- */
  _setLoading: (v) => set({ isLoading: v }),
  _setError:   (m) => set({ error: m, success: false }),
  _setSuccess: () => set({ success: true, error: null }),

  /* ---------- field / file updaters (same API as before) ---------- */
  updatePersonal: (field, value) =>
    set((s) => ({ personal: { ...s.personal, [field]: value } })),

  updateAddress: (field, value) =>
    set((s) => ({ address: { ...s.address, [field]: value } })),

  updateFile: (key, file) =>
    set((s) => ({ files: { ...s.files, [key]: file } })),

  /* ---------- reset everything ---------- */
  reset: () =>
    set({
      personal: { ...INITIAL_PERSONAL },
      address:  { ...INITIAL_ADDRESS },
      files:    { ...INITIAL_FILES },
      error: null,
      success: false,
    }),

  /* ---------- hydrate personal info from auth user ---------- */
  hydrateFromAuth: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((s) => ({
      personal: {
        firstName: user.first_name || "",
        lastName:  user.last_name  || "",
        email:     user.email      || "",
        nationality: user.nationality || "",
      },
    }));
  },

  /* ---------- single submit ---------- */
  submitKyc: async () => {
    const { personal, address, files } = get();
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      set({ error: "User not authenticated" });
      return { success: false };
    }

    /* basic validation */
    const docPairs = Object.entries(files).filter(([, f]) => f);
    if (docPairs.length === 0) {
      set({ error: "Please upload at least one document" });
      return { success: false };
    }
    if (!personal.firstName || !personal.lastName || !personal.nationality || !address.city || !address.fullAddress) {
      set({ error: "Please fill all required fields" });
      return { success: false };
    }

    set({ isLoading: true, error: null, success: false });

    /* build FormData exactly as backend expects */
    const fd = new FormData();
    fd.append("user", user.id);
    fd.append("first_name", personal.firstName.trim());
    fd.append("last_name", personal.lastName.trim());
    fd.append("email", personal.email.trim().toLowerCase());
    fd.append("nationality", personal.nationality.trim().toLowerCase());
    fd.append("city", address.city.trim());
    fd.append("district", address.district.trim());
    fd.append("full_address", address.fullAddress.trim());

    /* pick first doc type & files */
    const [docType, frontFile] = docPairs[0];
    fd.append("document_type", docType === "passport" ? "passport" : docType === "nationalId" ? "national_id" : "drivers_license");
    fd.append("document_front", frontFile);
    /* optional back side (nationalId / driversId) */
    const backFile = files.nationalId || files.driversId;
    if (backFile && backFile !== frontFile) fd.append("document_back", backFile);

    const res = await authService.kyc.submit(fd);
    set({ isLoading: false });

    if (res.error) {
      const msg = res.data?.message || "KYC submission failed";
      set({ error: msg });
      return { success: false, error: msg };
    }

    set({ success: true });
    return { success: true, data: res.data };
  },
}));

/* ---------- convenience selectors (optional) ---------- */
export const selectPersonal   = (s) => s.personal;
export const selectAddress    = (s) => s.address;
export const selectFiles      = (s) => s.files;
export const selectKycStatus  = (s) => ({ isLoading: s.isLoading, error: s.error, success: s.success });