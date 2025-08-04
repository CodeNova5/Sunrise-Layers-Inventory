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
  type GroupStore,
  createGroupStore,
  initialGroupState,
  fetchGroups,
} from "../stores/group-store";

export const GroupStoreContext = createContext<StoreApi<GroupStore> | null>(
  null
);

export function GroupStoreProvider({ children }: { children: ReactNode }) {
  const store = useRef<StoreApi<GroupStore>>(
    createGroupStore(initialGroupState)
  );
  const storeStatus = useRef("idle");

  useEffect(() => {
    if (storeStatus.current == "idle") {
      storeStatus.current = "loading";
      fetchGroups().then((groups) => {
        store.current.setState({ groups, status: "idle" });
        storeStatus.current = "ready";
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GroupStoreContext.Provider value={store.current}>
      {children}
    </GroupStoreContext.Provider>
  );
}

export function useGroupStore<T>(selector: (store: GroupStore) => T) {
  const store = useContext(GroupStoreContext);
  if (!store) {
    throw new Error("useGroupStore must be used within a GroupStoreProvider");
  }
  return useStore(store, selector);
}
