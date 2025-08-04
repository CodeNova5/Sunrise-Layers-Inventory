import { PaginatedDocs } from "./pagination";

export interface ExternalInvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface ExternalInvoiceClient {
  fullName: string;
  email: string;
  address: string;
  phone: string;
}

export interface ExternalInvoice {
  id: string;
  client: ExternalInvoiceClient;
  items: ExternalInvoiceItem[];
  discount: number;
  tax: number;
  shipping: number;
  paymentMade: number;
  dueDate: string;
  createdAt: string;
  loggedBy: string;
}

export interface PaginatedExternalInvoices extends PaginatedDocs {
  invoices: ExternalInvoice[];
}

export type NewExternalInvoice = Omit<
  ExternalInvoice,
  "id" | "createdAt" | "loggedBy" | "items"
> & {
  items: Omit<ExternalInvoiceItem, "id">[];
};

export type ExternalInvoiceModification = Partial<{
  discount: number;
  items: ExternalInvoiceItem[];
  tax: number;
  shipping: number;
  paymentMade: number;
  dueDate: string;
}>;

type HasMinMax = Partial<{
  gte: string;
  lte: string;
}>;

type HasBeforeAfter = Partial<{
  before: string;
  after: string;
}>;

export type ExternalInvoiceFilter = Partial<{
  loggedBy: string;
  query: string;
  tax: HasMinMax;
  discount: HasMinMax;
  payment: HasMinMax;
  dueDate: HasBeforeAfter;
  created: HasBeforeAfter;
}>;
