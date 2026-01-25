import { create } from 'zustand';
export const useAuthStore = create((set) => ({
  showLogoutModal: false,
  openLogoutModal: () => set({ showLogoutModal: true }),
  closeLogoutModal: () => set({ showLogoutModal: false }),
  globalLoading: false,
  setGlobalLoading: (v) => set({ globalLoading: v }),
}));

export default useAuthStore;