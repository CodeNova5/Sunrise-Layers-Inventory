import axios from "@/lib/axios";
import { createStore } from "zustand/vanilla";
import { NewPayment, PaginatedPayments, Payment, PaymentSort } from "../@types/payments";
import { PaymentMethod } from "../@types/order";

const endpoint = "/api/payments";

export type PaymentFilter = {
  paymentMethod?: PaymentMethod;
  orderId?: string;
  customerId?: string;
  minAmount?: number;
  maxAmount?: number;
  minCreatedAt?: Date;
  maxCreatedAt?: Date;
};

export type Status = "idle" | "loading" | "loaded" | "error";

export interface PaymentState extends PaginatedPayments {
  filter: PaymentFilter;
  sort: PaymentSort;
  payments: Payment[];
  status: Status;
}

export interface PaymentActions {
  setPayments: (payments: Payment[]) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  applyFilter: (filter: PaymentFilter) => void;
  clearFilter: () => void;
  applySort: (sort: PaymentSort) => void;
  clearSort: () => void;
  reset: () => void;
}

export type PaymentStore = PaymentState & PaymentActions;

const filterParamNames: Record<keyof PaymentFilter, string> = {
  orderId: "order",
  customerId: "customer",
  minAmount: "amount[gte]",
  maxAmount: "amount[lte]",
  minCreatedAt: "created[after]",
  maxCreatedAt: "created[before]",
  paymentMethod: "method",
};

const sortParamNames: Record<keyof PaymentSort, string> = {
  amount: "sort[amount]",
  createdAt: "sort[createdAt]",
};

export async function fetchPayment(id: string): Promise<Payment> {
  const { data } = await axios.get<Payment>(`${endpoint}/${id}`);
  return data;
}

export async function createPayment(payment: Omit<NewPayment, "confirmedBy">): Promise<Payment> {
  const { data } = await axios.post<Payment>(endpoint, payment);
  return data;
}

export async function fetchPayments(
  filter: PaymentFilter,
  sort: PaymentSort,
  page: number,
  limit: number
): Promise<PaginatedPayments> {
  const params = new URLSearchParams();
  Object.entries(filter).forEach(([key, value]) => {
    if (value) {
      params.append(
        filterParamNames[key as keyof PaymentFilter],
        value instanceof Date ? value.toISOString() : value.toString()
      );
    }
  });
  Object.entries(sort).forEach(([key, value]) => {
    if (value) {
      const param = sortParamNames[key as keyof PaymentSort];
      if (!param) {
        console.error(`Invalid sort key: ${key}`);
        return;
      }
      params.append(param, value.toString());
    }
  });
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  const { data } = await axios.get<PaginatedPayments>(`${endpoint}?${params}`);
  return data;
}

export const initialPaymentState: PaymentState = {
  filter: {},
  sort: {},
  payments: [],
  status: "idle",
  page: 1,
  limit: 10,
  totalDocs: 0,
  pageCount: 0,
  next: null,
  prev: null,
  hasNextPage: false,
  hasPrevPage: false,
};

export const createPaymentStore = (state: PaymentState = initialPaymentState) =>
  createStore<PaymentStore>((set) => ({
    ...state,
    setPayments: (payments) => set({ payments }),
    setPage: (page) =>
      set((state) => {
        if (page < 1 || page > state.pageCount || page === state.page) {
          return {};
        }
        fetchPayments(state.filter, state.sort, page, state.limit).then(
          (data) => {
            set({ ...data, page, status: "loaded" });
          }
        );
        return { status: "loading" };
      }),
    setLimit: (limit) =>
      set((state) => {
        if (limit < 1 || limit === state.limit) {
          return {};
        }
        fetchPayments(state.filter, state.sort, 1, limit).then((data) => {
          set({ ...data, limit, status: "loaded" });
        });
        return { status: "loading" };
      }),
    applyFilter: (filter) =>
      set((state) => {
        fetchPayments(filter, state.sort, 1, state.limit).then((data) => {
          set({ ...data, filter, status: "loaded" });
        });
        return { status: "loading" };
      }),
    clearFilter: () =>
      set((state) => {
        fetchPayments({}, state.sort, 1, state.limit).then((data) => {
          set({ ...data, filter: {}, status: "loaded" });
        });
        return { status: "loading" };
      }),
    applySort: (sort) =>
      set((state) => {
        fetchPayments(state.filter, sort, 1, state.limit).then((data) => {
          set({ ...data, sort, status: "loaded" });
        });
        return { status: "loading" };
      }),
    clearSort: () =>
      set((state) => {
        fetchPayments(state.filter, {}, 1, state.limit).then((data) => {
          set({ ...data, sort: {}, status: "loaded" });
        });
        return { status: "loading" };
      }),
    reset: () => set(initialPaymentState),
  }));
