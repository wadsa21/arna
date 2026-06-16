import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: ({ user, access, refresh }) =>
        set({ user, accessToken: access, refreshToken: refresh }),

      setTokens: ({ access, refresh }) =>
        set({ accessToken: access, refreshToken: refresh }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!useAuthStore.getState().accessToken,
    }),
    { name: "arna-auth" }
  )
);
