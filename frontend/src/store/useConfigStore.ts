import { create } from "zustand";
import api from "@/lib/api";

interface ConfigState {
  taglineLanguage: "hindi" | "english";
  instituteName: string;
  allowedEmailPatterns: string[];
  isLoaded: boolean;
  isSetupComplete: boolean;
  fetchConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  taglineLanguage: "hindi",
  instituteName: "Resource-Adda",
  allowedEmailPatterns: [],
  isLoaded: false,
  isSetupComplete: true, // Default true to be safe

  fetchConfig: async () => {
    try {
      const response = await api.get("/setup/settings/public");
      console.log(
        "Fetched Settings from API:",
        response.data.allowedEmailPatterns,
      );
      set({
        taglineLanguage: response.data.taglineLanguage,
        instituteName: response.data.instituteName,
        allowedEmailPatterns: response.data.allowedEmailPatterns || [],
        isSetupComplete: response.data.isSetupComplete,
        isLoaded: true,
      });
    } catch (error) {
      console.error("Failed to fetch public settings", error);
      set({ isLoaded: true });
    }
  },
}));
