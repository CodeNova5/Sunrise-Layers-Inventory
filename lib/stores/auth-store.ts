import { create } from "zustand";
import { createStore } from "zustand/vanilla";
import axios from "@/lib/axios";
import { User, AnonymousUser } from "../@types/user";

export type AuthState =
  | (AnonymousUser & { loggedIn: false })
  | (User & { loggedIn: true });

export interface AuthActions {
  setAuth: (auth: AuthState) => void;
  clearAuth: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

export const defaultAuthState: AuthState = {
  id: null,
  email: null,
  firstName: null,
  lastName: null,
  loggedIn: false,
  phone: null,
  permissions: {},
  groups: [],
};

export const createAuthStore = (state: AuthState) => {
  return createStore<AuthStore>((set) => ({
    ...state,
    setAuth: (auth: AuthState) => set(auth),
    clearAuth: async () => {
      try {
        const res = await axios.post("/api/auth/logout");
        if (res.status !== 200) {
          throw res;
        }
        set(defaultAuthState);
      } catch (error) {
        console.error("Failed to logout", error);
        throw error;
      }
    },
  }));
};
