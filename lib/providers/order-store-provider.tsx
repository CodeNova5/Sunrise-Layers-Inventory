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
  type OrderStore,
  createOrderStore,
  initialOrderState,
  fetchOrders,
} from "../stores/order-store";
import { useQueryState } from "nuqs";
import { OrderSort } from "../@types/order";


export const OrderStoreContext = createContext<StoreApi<OrderStore> | null>(
  null
);

export function OrderStoreProvider({ children }: { children: ReactNode }) {
  const store = useRef<StoreApi<OrderStore>>(
    createOrderStore(initialOrderState)
  );
  const page = 1;
  const [query, _] = useQueryState("order:q", { defaultValue: "" });
  const [limit, setLimit] = useState(10);
  const storeStatus = useRef("idle");
  const filter = {query};
  const sort = {createdAt: -1} as OrderSort;

  useEffect(() => {
    if (localStorage.getItem("order:limit")) {
      setLimit(Number(localStorage.getItem("order:limit")));
    };
    if (storeStatus.current == "idle") {
      storeStatus.current = "loading";
      fetchOrders(filter, sort, page, limit).then((state) => {
        store.current.setState({ ...state, filter, sort, status: "loaded" });
        storeStatus.current = "ready";
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OrderStoreContext.Provider value={store.current}>
      {children}
    </OrderStoreContext.Provider>
  );
}

export function useOrderStore<T>(selector: (store: OrderStore) => T) {
  const store = useContext(OrderStoreContext);
  if (!store) {
    throw new Error("useOrderStore must be used within a OrderStoreProvider");
  }
  return useStore(store, selector);
}