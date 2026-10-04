import { create } from "zustand";

interface SearchStore {
  isOpen: boolean;
  searchQuery: string;
  openSearch: (initialQuery?: string) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  searchQuery: "",
  openSearch: (initialQuery = "") => set({ isOpen: true, searchQuery: initialQuery }),
  closeSearch: () => set({ isOpen: false, searchQuery: "" }),
  toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
