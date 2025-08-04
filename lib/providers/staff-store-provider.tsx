'use client';
import { type ReactNode, createContext, useRef, useContext, useState, useEffect } from "react";
import { type StoreApi, useStore } from "zustand";
import { type StaffStore, createStaffStore, defaultStaffState, getStaffs, getGroups } from "../stores/staff-store";
import { useQueryState } from "nuqs";

export const StaffStoreContext = createContext<StoreApi<StaffStore> | null>(null);

export function StaffStoreProvider({ children }: { children: ReactNode }) {
    const store = useRef<StoreApi<StaffStore>>(createStaffStore(defaultStaffState));
    const [query, setQuery] = useQueryState("query", { defaultValue: "" });
    const [selectedGroup, setSelectedGroup] = useQueryState("group", { defaultValue: ""});
    const [selectedStatus, setSelectedStatus] = useQueryState("status", {defaultValue: ""});
    const storeStatus = useRef("idle");
    const filter = {
        query,
        group: selectedGroup,
        status: selectedStatus as "active" | "banned"
    };
    

    useEffect(() => {
        const limit = localStorage.getItem("limit")  as number | null || 10;
        const page = 1;
        if (storeStatus.current == "idle") {
            storeStatus.current = "loading";
            getStaffs(page, limit, filter).then((state): void => {
                store.current.setState({...state, filter, loaded: true});
                storeStatus.current = "ready";
            });
            getGroups().then((groups) => {
                store.current.setState({groups});
                storeStatus.current = "ready";
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <StaffStoreContext.Provider value={store.current}>{children}</StaffStoreContext.Provider>;
}

export function useStaffStore<T>(selector: (store: StaffStore) => T): T {
    const store = useContext(StaffStoreContext);
    if (!store) {
        throw new Error("useStaffStore must be used within an StaffStoreProvider");
    }
    return useStore(store, selector);
}