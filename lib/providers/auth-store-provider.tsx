'use client';
import { type ReactNode, createContext, useRef, useContext, useState, useEffect } from "react";
import { type StoreApi, useStore } from "zustand";
import { type AuthStore, type AuthState, createAuthStore, defaultAuthState } from "@/lib/stores/auth-store";
import axios from "@/lib/axios";

export const AuthStoreContext = createContext<StoreApi<AuthStore> | null>(null);


export async function getAuthState(): Promise<AuthState> {
    try {
        const response = await axios.get("/api/auth/me");
        if (response.status !== 200) {
            throw response;
        }
        return {
            loggedIn: true,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            id: response.data.id,
            phone: response.data.phone,
            groups: response.data.groups,
            permissions: response.data.permissions
        }
    } catch (error) {
        console.error("Error getting auth state", error);
        return {
            id: null,
            email: null,
            firstName: null,
            lastName: null,
            loggedIn: false,
            phone: null,
            groups: [],
            permissions: {}
        };
    }
}



export function AuthStoreProvider({ children }: { children: ReactNode }) {
    const store = useRef<StoreApi<AuthStore>>(createAuthStore(defaultAuthState));
    const storeLoaded = useRef(false);

    useEffect(() => {
        if (!storeLoaded.current) {
            getAuthState().then((state) => {
                store.current.setState(state);
                storeLoaded.current = true;
            });
        }
    }, []);

    return <AuthStoreContext.Provider value={store.current}>{children}</AuthStoreContext.Provider>;
}


export function useAuthStore<T>(selector: (store: AuthStore) => T): T {
    const store = useContext(AuthStoreContext);
    if (!store) {
        throw new Error("useAuthStore must be used within an AuthStoreProvider");
    }
    return useStore(store, selector);
}