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
  type BuyerStore,
  createBuyerStore,
  initialBuyerState,
  fetchBuyers,
} from "../stores/buyer-store";
import { useQueryState } from "nuqs";


export const BuyerStoreContext = createContext<StoreApi<BuyerStore> | null>(
  null
);

export function BuyerStoreProvider({ children }: { children: ReactNode }) {
  const store = useRef<StoreApi<BuyerStore>>(
    createBuyerStore(initialBuyerState)
  );
  const page = 1;
  const [search, _] = useQueryState("buyer:q", { defaultValue: "" });
  const [limit, setLimit] = useState(10);
  const storeStatus = useRef("idle");
  const filter = {search};

  useEffect(() => {
    if (localStorage.getItem("buyer:limit")) {
      setLimit(Number(localStorage.getItem("buyer:limit")));
    };
    if (storeStatus.current == "idle") {
      storeStatus.current = "loading";
      fetchBuyers(page, limit, filter).then((state) => {
        store.current.setState({ ...state, filter, state: "loaded" });
        storeStatus.current = "ready";
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BuyerStoreContext.Provider value={store.current}>
      {children}
    </BuyerStoreContext.Provider>
  );
}


export function useBuyerStore<T>(selector: (store: BuyerStore) => T): T {
  const store = useContext(BuyerStoreContext);
  if (!store) {
    throw new Error("useBuyerStore must be used within an BuyerStoreProvider");
  }
  return useStore(store, selector);
}