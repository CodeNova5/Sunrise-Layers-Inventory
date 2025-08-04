import axios from "@/lib/axios";
import { createStore } from "zustand/vanilla";
import {
  ExternalInvoice,
  ExternalInvoiceFilter,
  ExternalInvoiceModification,
  NewExternalInvoice,
  PaginatedExternalInvoices,
} from "../@types/invoice";

const endpoint = "/api/invoices";

export interface ExternalInvoiceState extends PaginatedExternalInvoices {
  filter: ExternalInvoiceFilter;
  selectedInvoice: ExternalInvoice | null;
  status: "idle" | "loading" | "loaded" | "error";
}

export interface ExternalInvoiceActions {
  setInvoices: (invoices: ExternalInvoice[]) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  applyFilter: (filter: ExternalInvoiceFilter) => void;
  clearFilter: () => void;
  getInvoice: (id: string) => Promise<ExternalInvoice>;
  createInvoice: (invoice: NewExternalInvoice) => Promise<ExternalInvoice>;
  updateInvoice: (
    id: string,
    update: ExternalInvoiceModification
  ) => Promise<ExternalInvoice>;
  deleteInvoice: (id: string) => Promise<void>;
  selectInvoice: (invoice: ExternalInvoice) => void;
  clearSelectedInvoice: () => void;
  clearInvoices: () => void;
  reset: () => void;
}

export type ExternalInvoiceStore = ExternalInvoiceState &
  ExternalInvoiceActions;

type FilterParams = {
  [key: string]: string | string[];
};

function buildFilterParams(filter: ExternalInvoiceFilter): FilterParams {
  const params: Partial<FilterParams> = {};

  if (filter.query) {
    params.q = filter.query;
  }

  if (filter.loggedBy) {
    params.loggedBy = filter.loggedBy;
  }

  if (filter.tax) {
    if (filter.tax.gte) params["tax[gte]"] = filter.tax.gte;
    if (filter.tax.lte) params["tax[lte]"] = filter.tax.lte;
  }

  if (filter.discount) {
    if (filter.discount.gte) params["discount[gte]"] = filter.discount.gte;
    if (filter.discount.lte) params["discount[lte]"] = filter.discount.lte;
  }

  if (filter.payment) {
    if (filter.payment.gte) params["payment[gte]"] = filter.payment.gte;
    if (filter.payment.lte) params["payment[lte]"] = filter.payment.lte;
  }

  if (filter.dueDate) {
    if (filter.dueDate.after) params["dueDate[after]"] = filter.dueDate.after;
    if (filter.dueDate.before)
      params["dueDate[before]"] = filter.dueDate.before;
  }

  if (filter.created) {
    if (filter.created.after) params["created[after]"] = filter.created.after;
    if (filter.created.before)
      params["created[before]"] = filter.created.before;
  }

  return params as FilterParams;
}
export const initialExternalInvoiceState: ExternalInvoiceState = {
  invoices: [],
  totalDocs: 0,
  limit: 10,
  page: 1,
  pageCount: 0,
  next: null,
  prev: null,
  hasNextPage: false,
  hasPrevPage: false,
  filter: {},
  selectedInvoice: null,
  status: "idle",
};

export async function fetchInvoices(
  filter: ExternalInvoiceFilter,
  page: number,
  limit: number
): Promise<PaginatedExternalInvoices> {
  const params = new URLSearchParams();
  const filterParams = buildFilterParams(filter);

  Object.entries(filterParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
  });
  params.append("p", page.toString());
  params.append("l", limit.toString());

  const url = `${endpoint}?${params.toString()}`;
  const response = await axios.get(url);
  return response.data;
}

export async function fetchInvoice(id: string): Promise<ExternalInvoice> {
  const response = await axios.get(`${endpoint}/${id}`);
  return response.data;
}

export async function createInvoice(
  invoice: NewExternalInvoice
): Promise<ExternalInvoice> {
  const response = await axios.post(endpoint, invoice);
  return response.data;
}

export async function updateInvoice(
  id: string,
  update: ExternalInvoiceModification
): Promise<ExternalInvoice> {
  const response = await axios.put(`${endpoint}/${id}`, update);
  return response.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await axios.delete(`${endpoint}/${id}`);
}

export const createExternalInvoiceStore = (
  state: ExternalInvoiceState = initialExternalInvoiceState
) =>
  createStore<ExternalInvoiceStore>((set) => ({
    ...state,
    setInvoices: (invoices) => set({ invoices }),
    setPage: (page) =>
      set((state) => {
        if (page === state.page) {
          return {};
        }
        fetchInvoices(state.filter, page, state.limit).then(set);
        return { status: "loading" };
      }),
    setLimit: (limit) =>
      set((state) => {
        if (limit === state.limit) {
          return {};
        }
        fetchInvoices(state.filter, state.page, limit).then((res) => {
          set({ ...res, status: "loaded" });
        });
        return { status: "loading" };
      }),
    applyFilter: (filter) =>
      set((state) => {
        fetchInvoices(filter, 1, state.limit).then((res) => {
          set({ ...res, status: "loaded" });
        });
        return { filter, status: "loading" };
      }),
    clearFilter: () =>
      set((state) => {
        fetchInvoices({}, 1, state.limit).then((res) => {
          set({ ...res, status: "loaded" });
        });
        return { filter: {}, status: "loading" };
      }),
    getInvoice: async (id) => {
      return await fetchInvoice(id);
    },
    createInvoice: async (invoice) => {
      const created = await createInvoice(invoice);
      set((state) => {
        fetchInvoices(state.filter, state.page, state.limit).then(set);
        return {};
      });
      return created;
    },
    updateInvoice: async (id, update) => {
      const updated = await updateInvoice(id, update);
      set((state) => {
        fetchInvoices(state.filter, state.page, state.limit).then(set);
        return {};
      });
      return updated;
    },
    deleteInvoice: async (id) => {
      await deleteInvoice(id);
      set((state) => {
        fetchInvoices(state.filter, state.page, state.limit).then(set);
        return {};
      });
    },
    selectInvoice: (invoice) => set({ selectedInvoice: invoice }),
    clearSelectedInvoice: () => set({ selectedInvoice: null }),
    clearInvoices: () => set({ invoices: [] }),
    reset: () => set(initialExternalInvoiceState),
  }));
