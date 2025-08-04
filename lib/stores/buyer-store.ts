import { PaginatedDocs } from "../@types/pagination";
import { Buyer } from "../@types/buyer";
import axios from "@/lib/axios";
import { createStore } from "zustand/vanilla";
import { get } from "lodash";

export type BuyerStoreState = "loaded" | "loading" | "error" | "idle";
export interface BuyerCreate extends Omit<Buyer, "id"> {}
export interface BuyerUpdate extends Partial<BuyerCreate> {}
export type PaginatedBuyers = PaginatedDocs & { buyers: Buyer[] };
export type BuyerStore = BuyerState & BuyerActions;

export type BuyerFilter = {
    search?: string;
};


export interface BuyerState extends PaginatedBuyers  {
  state: BuyerStoreState;
  filter: BuyerFilter;
}


export interface BuyerActions {
    setBuyers: (buyers: Buyer[]) => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    deleteBuyer: (buyerId: string) => Promise<void>;
    createBuyer: (buyer: BuyerCreate) => Promise<Buyer>;
    updateBuyer: (buyerId: string, buyer: BuyerUpdate) => Promise<Buyer>;
    getBuyer: (buyerId: string) => Promise<Buyer>;
    applyFilter: (filter: BuyerFilter) => Promise<void>;
    clearFilter: () => Promise<void>;
}

export const initialBuyerState: BuyerState = {
    state: "idle",
    page: 1,
    limit: 10,
    next: null,
    prev: null,
    pageCount: 0,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
    buyers: [],
    filter: {},
};

export async function fetchBuyers(page: number, limit: number, filter: BuyerFilter): Promise<PaginatedBuyers> {
    const params = new URLSearchParams();
    params.append("p", page.toString());
    params.append("l", limit.toString());
    if (filter.search) {
        params.append("q", filter.search);
    }
    const response = await axios.get(`/api/buyers?${params.toString()}`);
    const data = response.data;
    if (response.status !== 200) {
        throw new Error(data.message || "Failed to fetch buyers");
    }
    return data as PaginatedBuyers;
}

export async function fetchBuyer(buyerId: string): Promise<Buyer> {
    const response = await axios.get(`/api/buyers/${buyerId}`);
    const data = response.data;
    if (response.status !== 200) {
        throw new Error(data.message || "Failed to fetch buyer");
    }
    return data as Buyer;
}

export async function createBuyer(buyer: BuyerCreate): Promise<Buyer> {
    const response = await axios.post("/api/buyers", buyer);
    const data = response.data;
    if (response.status !== 201) {
        throw new Error(data.message || "Failed to create buyer");
    }
    return data as Buyer;
}

export async function updateBuyer(buyerId: string, buyer: BuyerUpdate): Promise<Buyer> {
    const response = await axios.put(`/api/buyers/${buyerId}`, buyer);
    const data = response.data;
    if (response.status !== 200) {
        throw new Error(data.message || "Failed to update buyer");
    }
    return data as Buyer;
}

export async function deleteBuyer(buyerId: string): Promise<void> {
    const response = await axios.delete(`/api/buyers/${buyerId}`);
    const data = response.data;
    if (response.status !== 204) {
        throw new Error(data.message || "Failed to delete buyer");
    }
}

export function createBuyerStore(state: BuyerState) {
    return createStore<BuyerStore>((set) => ({
        ...state,
        setBuyers: (buyers) => set({ buyers }),
        setPage: (page) => set((state) => {
            if (page === state.page) {
                return {};
            }
            fetchBuyers(page, state.limit, state.filter).then(set);
            return {};
        }),
        setLimit: (limit) => set((state) => {
            if (limit === state.limit) {
                return {};
            }
            fetchBuyers(state.page, limit, state.filter).then(res => {
                set({...res, state: "loaded"});
            });
            return {state: "loading"};
        }),
        deleteBuyer: async (buyerId) => {
            await deleteBuyer(buyerId);
            set((state) => {
                fetchBuyers(state.page, state.limit, state.filter).then(res => {
                    set({...res, state: "loaded"});
                });
                return {state: "loading"};
            });
        },
        createBuyer: async (buyer) => {
            const createdBuyer = await createBuyer(buyer);
            set((state) => {
                fetchBuyers(state.page, state.limit, state.filter).then(res => {
                    set({...res, state: "loaded"});
                });
                return {state: "loading"};
            });
            return createdBuyer;
        },
        updateBuyer: async (buyerId, buyer) => {
            const updatedBuyer = await updateBuyer(buyerId, buyer);
            set((state) => {
                fetchBuyers(state.page, state.limit, state.filter).then(res => {
                    set({...res, state: "loaded"});
                });
                return {state: "loading"};
            });
            return updatedBuyer;
        },
        getBuyer: async (buyerId) => {
            return fetchBuyer(buyerId);
        },
        applyFilter: async (filter) => {
            set((state) => {
                const page = 1; // Reset page to 1 when applying filter
                fetchBuyers(page, state.limit, filter).then(res => {
                    set({...res, state: "loaded", filter});
                });
                return {state: "loading"};
            });
        },
        clearFilter: async () => {
            set((state) => {
                fetchBuyers(state.page, state.limit, {}).then(res => {
                    set({...res, state: "loaded", filter: {}});
                });
                return {state: "loading"};
            });
        }
    }));
}