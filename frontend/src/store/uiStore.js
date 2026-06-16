import { create } from "zustand";

// Лёгкий стор для UI-состояния: выбранный ребёнок, сайдбар на мобиле
export const useUIStore = create((set) => ({
  selectedChildId: null,
  setSelectedChild: (id) => set({ selectedChildId: id }),

  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
