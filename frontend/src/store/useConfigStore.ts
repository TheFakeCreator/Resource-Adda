import { create } from "zustand";
import api from "@/lib/api";

interface ConfigState {
  taglineLanguage: "hindi" | "english";
  instituteName: string;
  allowedEmailPatterns: string[];
  isLoaded: boolean;
  fetchConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  taglineLanguage: "hindi",
  instituteName: "Resource-Adda",
  allowedEmailPatterns: [],
  isLoaded: false,
  fetchConfig: async () => {
    try {
      const response = await api.get("/setup/settings/public");
      set({
        taglineLanguage: response.data.taglineLanguage,
        instituteName: response.data.instituteName,
        allowedEmailPatterns: response.data.allowedEmailPatterns || [],
        isLoaded: true,
      });
    } catch (error) {
      console.error("Failed to fetch public settings", error);
      set({ isLoaded: true });
    }
  },
}));
