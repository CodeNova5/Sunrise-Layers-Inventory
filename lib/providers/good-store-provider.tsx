'use client';
import { type ReactNode, createContext, useRef, useContext, useState, useEffect } from "react";
import { type StoreApi, useStore } from "zustand";
import { type GoodStore, type GoodState, createGoodStore, defaultGoodState, getGoods, getCategories, GoodFilter } from "../stores/good-store";
import { useQueryState } from "nuqs";

export const GoodStoreContext = createContext<StoreApi<GoodStore> | null>(null);

export function GoodStoreProvider({ children }: { children: ReactNode }) {
    const store = useRef<StoreApi<GoodStore>>(createGoodStore(defaultGoodState));
    const [query, setQuery] = useQueryState("query", { defaultValue: "" });
    const [selectedCategory, setSelectedCategory] = useQueryState("category", { defaultValue: ""});
    const [selectedStatus, setSelectedStatus] = useQueryState("status", {defaultValue: ""});
    const storeStatus = useRef("idle");
    const filter = {
        query,
        category: selectedCategory,
        status: selectedStatus as "in-stock" | "low-stock" | "out-of-stock"
    };
    

    useEffect(() => {
        const limit = localStorage.getItem("limit")  as number | null || 10;
        const page = 1;
        if (storeStatus.current == "idle") {
            storeStatus.current = "loading";
            getGoods(page, limit, filter).then((state): void => {
                store.current.setState({...state, filter, loaded: true});
                getCategories().then((categories) => {
                    store.current.setState({ allCategories: categories });
                });
                storeStatus.current = "ready";
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <GoodStoreContext.Provider value={store.current}>{children}</GoodStoreContext.Provider>;
}

export function useGoodStore<T>(selector: (store: GoodStore) => T): T {
    const store = useContext(GoodStoreContext);
    if (!store) {
        throw new Error("useGoodStore must be used within an GoodStoreProvider");
    }
    return useStore(store, selector);
}