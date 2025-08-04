"use client";
import {
    type ReactNode,
    createContext,
    useRef,
    useContext,
    useEffect,
    useState,
} from "react";
import { type StoreApi, useStore } from "zustand";
import {
    type ExternalInvoiceStore,
    createExternalInvoiceStore,
    initialExternalInvoiceState,
    fetchInvoices,
} from "../stores/invoice-store";
import { useQueryState } from "nuqs";

export const ExternalInvoiceStoreContext = createContext<StoreApi<ExternalInvoiceStore> | null>(
    null
);

export function ExternalInvoiceStoreProvider({ children }: { children: ReactNode }) {
    const store = useRef<StoreApi<ExternalInvoiceStore>>(
        createExternalInvoiceStore(initialExternalInvoiceState)
    );
    const page = 1;
    const [loggedBy] = useQueryState("invoice:loggedBy");
    const [limit, setLimit] = useState(10);
    const storeStatus = useRef("idle");
    const filter = { loggedBy: loggedBy || undefined };

    useEffect(() => {
        if (localStorage.getItem("invoice:limit")) {
            setLimit(Number(localStorage.getItem("invoice:limit")));
        }
        if (storeStatus.current === "idle") {
            storeStatus.current = "loading";
            fetchInvoices(filter, page, limit).then((state) => {
                store.current.setState({ ...state, filter, status: "loaded" });
                storeStatus.current = "ready";
            });
        }
        console.log("invoice provider...");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ExternalInvoiceStoreContext.Provider value={store.current}>
            {children}
        </ExternalInvoiceStoreContext.Provider>
    );
}

export function useExternalInvoiceStore<T>(selector: (store: ExternalInvoiceStore) => T) {
    const store = useContext(ExternalInvoiceStoreContext);
    if (!store) {
        throw new Error("useExternalInvoiceStore must be used within an ExternalInvoiceStoreProvider");
    }
    return useStore(store, selector);
}