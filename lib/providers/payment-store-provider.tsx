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
    type PaymentStore,
    createPaymentStore,
    initialPaymentState,
    fetchPayments,
} from "../stores/payment-store";
import { useQueryState } from "nuqs";
import { PaymentSort } from "@/lib/@types/payments";
import { usePaymentFilter } from "../hooks/payments";

export const PaymentStoreContext = createContext<StoreApi<PaymentStore> | null>(
    null
);

export function PaymentStoreProvider({ children }: { children: ReactNode }) {
    const store = useRef<StoreApi<PaymentStore>>(
        createPaymentStore(initialPaymentState)
    );
    const page = 1;
    const [limit, setLimit] = useState(10);
    const storeStatus = useRef<"idle" | "loading" | "ready">("idle");
    const {getFilter} = usePaymentFilter();
    const sort = { createdAt: -1 } as PaymentSort;

    useEffect(() => {
        if (localStorage.getItem("payment:limit")) {
            setLimit(Number(localStorage.getItem("payment:limit")));
        }
        if (storeStatus.current == "idle") {
            storeStatus.current = "loading";
            const filter = getFilter();
            fetchPayments(filter, sort, page, limit).then((state) => {
                store.current.setState({ ...state, filter, sort, status: "loaded" });
                storeStatus.current = "ready";
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PaymentStoreContext.Provider value={store.current}>
            {children}
        </PaymentStoreContext.Provider>
    );
}

export function usePaymentStore<T>(selector: (store: PaymentStore) => T) {
    const store = useContext(PaymentStoreContext);
    if (!store) {
        throw new Error("usePaymentStore must be used within a PaymentStoreProvider");
    }
    return useStore(store, selector);
}