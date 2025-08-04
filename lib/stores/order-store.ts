import axios from "@/lib/axios";
import {
  Order,
  NewOrder,
  OrderStatus,
  OrderModification,
  PaginatedOrders,
  PaymentMethod,
  OrderSort,
  OrderSummary,
} from "../@types/order";
import { createStore } from "zustand/vanilla";

const endpoint = "/api/orders";

export type OrderFilter = Partial<{
  query: string;
  status: OrderStatus;
  minCostPrice: number;
  maxCostPrice: number;
  minDiscount: number;
  maxDiscount: number;
  minAmountPaid: number;
  maxAmountPaid: number;
  minOverdueLimit: Date;
  maxOverdueLimit: Date;
  minCreatedAt: Date;
  maxCreatedAt: Date;
  paymentMethod: PaymentMethod;
  items: string[];
}>;

export interface OrderState extends PaginatedOrders {
  filter: OrderFilter;
  sort: OrderSort;
  selectedOrder: Order | null;
  status: "idle" | "loading" | "loaded" | "error";
}

export interface OrderActions {
  setOrders: (orders: OrderSummary[]) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  applyFilter: (filter: OrderFilter) => void;
  clearFilter: () => void;
  applySort: (sort: OrderSort) => void;
  clearSort: () => void;
  getOrder: (id: string) => Promise<Order>;
  createOrder: (order: NewOrder) => Promise<Order>;
  updateOrder: (order: OrderModification) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  selectOrder: (order: Order) => void;
  clearSelectedOrder: () => void;
  clearOrders: () => void;
  reset: () => void;
}

export type OrderStore = OrderState & OrderActions;

const filterParamNames: Record<keyof OrderFilter, string> = {
  query: "q",
  status: "s",
  minCostPrice: "cost[gte]",
  maxCostPrice: "cost[lte]",
  minDiscount: "discount[gte]",
  maxDiscount: "discount[lte]",
  minAmountPaid: "paid[gte]",
  maxAmountPaid: "paid[lte]",
  minOverdueLimit: "overdue[after]",
  maxOverdueLimit: "overdue[before]",
  minCreatedAt: "created[after]",
  maxCreatedAt: "created[before]",
  paymentMethod: "method",
  items: "items",
};

export const initialOrderState: OrderState = {
  orders: [],
  totalDocs: 0,
  limit: 10,
  page: 1,
  pageCount: 0,
  next: null,
  prev: null,
  hasNextPage: false,
  hasPrevPage: false,
  filter: {},
  sort: {},
  selectedOrder: null,
  status: "idle",
};

function buildSortQuery(sort: OrderSort) {
  return Object.keys(sort).map((key) => [
    `sort[${key}]`,
    sort[key as keyof OrderSort]!.toString(),
  ]);
}

export async function fetchOrders(
  filter: OrderFilter,
  sort: OrderSort,
  page: number,
  limit: number
): Promise<PaginatedOrders> {
  // Implementation
  const params = new URLSearchParams();
  for (const key in filter) {
    if (key === "items" && filter.items) {
      const items = filter.items!;
      for (var i = 0; i < items.length; i++) {
        params.append(`${filterParamNames.items}[${i}]`, items[i]);
      }
    } else if (filter[key as keyof OrderFilter]) {
      params.append(
        filterParamNames[key as keyof OrderFilter],
        filter[key as keyof OrderFilter]!.toString()
      );
    }
  }
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  buildSortQuery(sort).forEach(([key, value]) => params.append(key, value));
  const url = `${endpoint}?${params.toString()}`;
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchOrder(id: string): Promise<Order> {
  // Implementation
  try {
    const response = await axios.get(`${endpoint}/${id}`);
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createOrder(order: NewOrder): Promise<Order> {
  // Implementation
  try {
    const response = await axios.post(endpoint, order);
    if (response.status !== 201) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateOrder(order: OrderModification): Promise<Order> {
  // Implementation
  try {
    const response = await axios.put(`${endpoint}/${order.id}`, order);
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteOrder(id: string): Promise<void> {
  // Implementation
  try {
    const response = await axios.delete(`${endpoint}/${id}`);
    if (response.status !== 204) {
      throw new Error(response.statusText);
    }
  } catch (error) {
    throw error;
  }
}

export const createOrderStore = (state: OrderState = initialOrderState) =>
  createStore<OrderStore>((set) => ({
    ...state,
    setOrders: (orders) => set({ orders }),
    setPage: (page) =>
      set((state) => {
        if (page === state.page) {
          return {};
        }
        fetchOrders(state.filter, state.sort, page, state.limit).then(set);
        return {};
      }),
    setLimit: (limit) =>
      set((state) => {
        if (limit === state.limit) {
          return {};
        }
        fetchOrders(state.filter, state.sort, state.page, limit).then((res) => {
          set({ ...res, status: "loaded" });
        });
        return { status: "loading" };
      }),
    applyFilter: (filter) =>
      set((state) => {
        fetchOrders(filter, state.sort, 1, state.limit).then((res) => {
          set({ ...res, status: "loaded" });
        });
        return { filter, status: "loading" };
      }),
    clearFilter: () =>
      set((state) => {
        fetchOrders({}, state.sort, 1, state.limit).then((res) => {
          set({ ...res, status: "loaded" });
        });
        return { filter: {}, status: "loading" };
      }),
    applySort: (sort) =>
      set((state) => {
        fetchOrders(state.filter, sort, 1, state.limit).then((res) => {
          set({ ...res, status: "loaded" });
        });
        return { sort, status: "loading" };
      }),
    clearSort: () =>
      set((state) => {
        fetchOrders(state.filter, {}, 1, state.limit).then((res) => {
          set({ ...res, status: "loaded" });
        });
        return { sort: {}, status: "loading" };
      }),
    getOrder: async (id) => {
      const order = await fetchOrder(id);
      return order;
    },
    createOrder: async (order) => {
      const createdOrder = await createOrder(order);
      fetchOrders(state.filter, state.sort, state.page, state.limit).then(set);
      return createdOrder;
    },
    updateOrder: async (order) => {
      const updatedOrder = await updateOrder(order);
      fetchOrders(state.filter, state.sort, state.page, state.limit).then(set);
      return updatedOrder;
    },
    deleteOrder: async (id) => {
      await deleteOrder(id);
      fetchOrders(state.filter, state.sort, state.page, state.limit).then(set);
    },
    selectOrder: (order) => set({ selectedOrder: order }),
    clearSelectedOrder: () => set({ selectedOrder: null }),
    clearOrders: () => set({ orders: [] }),
    reset: () => set(initialOrderState),
  }));
