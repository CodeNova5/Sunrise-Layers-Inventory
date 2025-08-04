import Good from "../@types/goods";
import { createStore } from "zustand/vanilla";
import axios from "@/lib/axios";
import lodash from "lodash";

export interface GoodCreate {
    name: string;
    costPrice: number;
    qty: number;
    description: string;
    categories: string[];
    minQty: number;
    productId: string;
}

export interface PaginatedGoods {
    goods: Good[];
    page: number;
    limit: number;
    pageCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export type GoodFilter = {
    category?: string;
    status?: "in-stock" | "low-stock" | "out-of-stock";
    query?: string;
    qty?: {
        gte?: number;
        lte?: number;
    };
};

export type GoodState = {
    goods: Good[];
    page: number;
    limit: number;
    filter: GoodFilter;
    allCategories: string[];
    pageCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    goodId: string;
    goodTitle: string;
    loaded: boolean;
};

export interface GoodActions {
    setGoods: (goods: Good[]) => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    deleteGood: (goodId: string) => Promise<void>;
    createGood: (good: GoodCreate) => Promise<void>;
    updateGood: (goodId: string, good: Partial<GoodCreate>) => Promise<void>;
    getGood: (goodId: string) => Promise<Good>;
    setFilter: (filter: GoodFilter) => void;
    applyFilter: (filter: GoodFilter) => void;
    clearFilter: () => void;
}

export type GoodStore = GoodState & GoodActions;
export const goodCategories = [
    "Engine Parts",
    "Transmission Parts",
    "Suspension and Steering",
    "Brakes",
    "Exhaust and Emission",
    "Cooling System",
    "Electrical and Lighting",
    "Fuel System",
    "Body and Interior",
    "Tires and Wheels",
    "Lubricants and Fluids",
    "Tools and Equipment",
    "Accessories",
];

export const defaultGoodState: GoodState = {
    goods: [],
    page: 0,
    limit: 5,
    filter: {},
    pageCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    goodId: "",
    goodTitle: "",
    allCategories: [],
    loaded: false,
};

export const createGood = async (good: GoodCreate): Promise<Good> => {
    try {
        const response = await axios.post("/api/goods", good);
        if (response.status !== 201) {
            throw response;
        }
        const newGood = response.data;
        return {
            id: newGood.id as string,
            name: newGood.name as string,
            description: newGood.description as string,
            categories: newGood.categories as string[],
            productCode: newGood.productId as string,
            unitPrice: newGood.costPrice as number,
            qtyInStock: newGood.qty as number,
            minQtyThreshold: newGood.minQty as number,
            totalValue: newGood.costPrice * newGood.qty,
            status:
                newGood.qty > newGood.minQty
                    ? "in-stock"
                    : newGood.qty > 0
                    ? "low-stock"
                    : "out-of-stock",
        };
    } catch (error) {
        throw error;
    }
};

export const updateGood = async (
    goodId: string,
    good: Partial<GoodCreate>
): Promise<Good> => {
    try {
        const response = await axios.put(`/api/goods/${goodId}`, good);
        if (response.status !== 200) {
            throw response;
        }
        const updatedGood = response.data;
        return {
            id: goodId,
            name: updatedGood.name as string,
            description: updatedGood.description as string,
            categories: updatedGood.categories as string[],
            productCode: updatedGood.productId as string,
            unitPrice: updatedGood.costPrice as number,
            qtyInStock: updatedGood.qty as number,
            minQtyThreshold: updatedGood.minQty as number,
            totalValue: updatedGood.costPrice * updatedGood.qty,
            status:
                updatedGood.qty > updatedGood.minQty
                    ? "in-stock"
                    : updatedGood.qty > 0
                    ? "low-stock"
                    : "out-of-stock",
        };
    } catch (error) {
        throw error;
    }
};

export const getGood = async (goodId: string): Promise<Good> => {
    try {
        const response = await axios.get(`/api/goods/${goodId}`);
        if (response.status !== 200) {
            throw response;
        }
        const good = response.data;
        return {
            id: goodId,
            name: good.name as string,
            description: good.description as string,
            categories: good.categories as string[],
            productCode: good.productId as string,
            unitPrice: good.costPrice as number,
            qtyInStock: good.qty as number,
            minQtyThreshold: good.minQty as number,
            totalValue: good.costPrice * good.qty,
            status:
                good.qty > good.minQty
                    ? "in-stock"
                    : good.qty > 0
                    ? "low-stock"
                    : "out-of-stock",
        };
    } catch (error) {
        throw error;
    }
};

export const deleteGood = async (goodId: string): Promise<void> => {
    try {
        const response = await axios.delete(`/api/goods/${goodId}`);
        if (response.status !== 204) {
            throw response;
        }
    } catch (error) {
        throw error;
    }
};

export const getGoods = async (
    page: number,
    limit: number,
    filter?: GoodFilter
): Promise<PaginatedGoods> => {
    const queryParams = new URLSearchParams();
    queryParams.append("l", limit.toString());
    queryParams.append("p", page.toString());
    if (filter) {
        filter.category && queryParams.append("c", filter.category);
        filter.status && queryParams.append("s", filter.status);
        filter.query && queryParams.append("q", filter.query);
        filter.qty?.gte && queryParams.append("qty[gte]", filter.qty.gte.toString());
        filter.qty?.lte && queryParams.append("qty[lte]", filter.qty.lte.toString());
    }
    try {
        const response = await axios.get(
            `/api/goods/all?${queryParams.toString()}`
        );
        if (response.status !== 200) {
            throw response;
        }
        const goods: any[] = response.data.goods;
        return {
            goods: goods.map((good: any) => ({
                id: good.id as string,
                name: good.name as string,
                description: good.description as string,
                categories: good.categories as string[],
                productCode: good.productId as string,
                unitPrice: good.costPrice as number,
                qtyInStock: good.qty as number,
                minQtyThreshold: good.minQty as number,
                totalValue: good.costPrice * good.qty,
                status:
                    good.qty > good.minQty
                        ? "in-stock"
                        : good.qty > 0
                        ? "low-stock"
                        : "out-of-stock",
            })),
            page,
            limit,
            pageCount: response.data.totalPages,
            hasNextPage: response.data.hasNextPage,
            hasPrevPage: response.data.hasPrevPage,
        };
    } catch (error) {
        throw error;
    }
};

export const getCategories = async (): Promise<string[]> => {
    try {
        const response = await axios.get("/api/goods/categories");
        if (response.status !== 200) {
            throw response;
        }
        return response.data as string[];
    } catch (error) {
        throw error;
    }
};

export const createGoodStore = (state: GoodState) => {
    return createStore<GoodStore>((set) => {
        return {
            ...state,
            setGoods: (goods: Good[]) => set({ goods }),
            setPage: (page: number) => set((state) => {
                if (page === state.page) {
                    return {};
                }
                getGoods(page, state.limit, state.filter).then((result) => {
                    set(result);
                });
                return {};
            }),
            setLimit: (limit: number) => set((state) => {
                if (limit === state.limit) {
                    return {};
                }
                const page = 1; // reset the page to 1 when changing the limit
                getGoods(page, limit).then((result) => {
                    set(result);
                });
                return {};
            }),
            deleteGood: async (goodId: string) => {
                await deleteGood(goodId);
                set((state) => {
                    const newGoods = state.goods.filter(
                        (good) => good.id !== goodId
                    );
                    set({ goods: newGoods });
                    return {};
                });
            },
            createGood: async (good: GoodCreate) => {
                const newGood = await createGood(good);
                // TODO: refetch the goods to maintain correct pagination
                set((state) => ({ goods: [...state.goods, newGood] }));
            },
            updateGood: async (goodId: string, good: Partial<GoodCreate>) => {
                const updatedGood = await updateGood(goodId, good);
                set((state) => {
                    const newGoods = state.goods.map((g) =>
                        g.id === goodId ? updatedGood : g
                    );
                    set({ goods: newGoods });
                    return {};
                });
            },
            getGood: async (goodId: string) => {
                let good = state.goods.find((good) => good.id === goodId);
                if (!good) {
                    good = await getGood(goodId);
                }
                return good;
            },
            setFilter: (filter: GoodFilter) => set({ filter }),
            applyFilter: (filter: GoodFilter) => set((state) => {
                const page = 1; // reset the page to 1 when applying a filter
                if (lodash.isEqual(filter, state.filter)) {
                    return {};
                }
                getGoods(page, state.limit, filter).then((result) => {
                    set({ ...result, filter });
                });
                return {};
            }),
            clearFilter: () => set((state) => {
                if (lodash.isEmpty(state.filter)) {
                    return {};
                }
                getGoods(state.page, state.limit).then((result) => {
                    set({ ...result, filter: {} });
                });
                return {};
            }),
        };
    });
};
