"use client";

import { create } from "zustand";
import type { EquipmentData, DataSummary, UploadHistory } from "./types";
import {
  setAuthCredentials,
  clearAuthCredentials,
  getStoredUsername,
  verifyCredentials,
  isDemoMode,
} from "./api";

interface User {
  username: string;
  isAuthenticated: boolean;
}

interface AppState {
  user: User | null;
  isAuthLoading: boolean;
  demoMode: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;

  currentData: EquipmentData[];
  currentSummary: DataSummary | null;
  setCurrentData: (data: EquipmentData[], summary: DataSummary) => void;

  uploadHistory: UploadHistory[];
  setUploadHistory: (history: UploadHistory[]) => void;
  addToHistory: (entry: UploadHistory) => void;
  clearHistory: () => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthLoading: true,
  demoMode: false,

  login: async (username: string, password: string) => {
    const result = await verifyCredentials(username, password);

    if (result.success) {
      setAuthCredentials(username, password);
      set({
        user: { username, isAuthenticated: true },
        demoMode: result.demoMode,
      });
      return true;
    }
    return false;
  },

  logout: () => {
    clearAuthCredentials();
    set({
      user: null,
      demoMode: false,
      currentData: [],
      currentSummary: null,
      uploadHistory: [],
    });
  },

  checkAuth: () => {
    const username = getStoredUsername();
    if (username) {
      set({
        user: { username, isAuthenticated: true },
        isAuthLoading: false,
        demoMode: isDemoMode(),
      });
    } else {
      set({ isAuthLoading: false });
    }
  },

  currentData: [],
  currentSummary: null,
  setCurrentData: (data, summary) =>
    set({ currentData: data, currentSummary: summary }),

  uploadHistory: [],
  setUploadHistory: (history) => set({ uploadHistory: history }),
  addToHistory: (entry) => {
    set((state) => ({
      uploadHistory: [entry, ...state.uploadHistory].slice(0, 5),
    }));
  },
  clearHistory: () => set({ uploadHistory: [] }),

  activeTab: "upload",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
