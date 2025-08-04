import { FilterQuery, Types } from "mongoose";
import ExternalInvoiceModel, {
  IExternalInvoiceDocument,
} from "../models/externalInvoice";
import { EntityNotFound, PageNotFound, ValueError } from "@/lib/errors";
import {
  ExternalInvoice,
  ExternalInvoiceModification,
  NewExternalInvoice,
  PaginatedExternalInvoices,
} from "@/lib/@types/invoice";

function transformInvoice(doc: IExternalInvoiceDocument): ExternalInvoice {
  return {
    id: doc._id.toString(),
    client: {
      fullName: doc.client.fullName,
      email: doc.client.email,
      address: doc.client.address,
      phone: doc.client.phone,
    },
    items: doc.items.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    })),
    discount: doc.discount,
    tax: doc.tax,
    shipping: doc.shipping,
    paymentMade: doc.paymentMade,
    dueDate: doc.dueDate.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    loggedBy: doc.loggedBy.toString(),
  };
}

async function createExternalInvoice(
  params: NewExternalInvoice & { loggedBy: Types.ObjectId }
): Promise<ExternalInvoice> {
  const invoice = new ExternalInvoiceModel({
    ...params,
    dueDate: new Date(params.dueDate),
  });
  await invoice.save();
  return transformInvoice(invoice);
}

async function getExternalInvoiceById(
  id: Types.ObjectId
): Promise<ExternalInvoice> {
  const invoice = await ExternalInvoiceModel.findById(id).exec();
  if (!invoice) {
    EntityNotFound.throw("Invoice", id.toString());
  }
  return transformInvoice(invoice);
}

async function deleteExternalInvoice(
  id: Types.ObjectId
): Promise<ExternalInvoice> {
  const invoice = await ExternalInvoiceModel.findByIdAndDelete(id);
  if (!invoice) {
    EntityNotFound.throw("Invoice", id.toString());
  }
  return transformInvoice(invoice);
}

async function updateExternalInvoice(
  id: Types.ObjectId,
  params: ExternalInvoiceModification
): Promise<ExternalInvoice> {
  if (params.paymentMade && params.paymentMade < 0) {
    ValueError.throw("Payment made cannot be negative");
  }

  const updateQuery: any = { ...params };
  if (params.paymentMade) {
    updateQuery.$inc = { paymentMade: params.paymentMade };
    delete updateQuery.paymentMade;
  }
  if (params.dueDate) {
    updateQuery.dueDate = new Date(params.dueDate);
  }

  const invoice = await ExternalInvoiceModel.findOneAndUpdate(
    { _id: id },
    updateQuery,
    { new: true }
  ).exec();

  if (!invoice) {
    EntityNotFound.throw("Invoice", id.toString());
  }
  return transformInvoice(invoice);
}

async function getExternalInvoices({
  filters,
  page = 1,
  limit = 10,
}: {
  filters: FilterQuery<IExternalInvoiceDocument>;
  page: number;
  limit: number;
}): Promise<PaginatedExternalInvoices> {
  if (page < 1) {
    PageNotFound.throw(page, "ExternalInvoice", { query: filters, limit });
  }
  if (limit < 1) {
    PageNotFound.throw(page, "ExternalInvoice", { query: filters, limit });
  }

  const totalDocs = await ExternalInvoiceModel.countDocuments(filters).exec();
  const pageCount = Math.ceil(totalDocs / limit);

  if (page > 1 && page > pageCount) {
    PageNotFound.throw(page, "ExternalInvoice", { query: filters, limit });
  }

  const skip = (page - 1) * limit;
  const invoices = await ExternalInvoiceModel.find(filters)
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  const next = invoices.length === limit ? page + 1 : null;
  const prev = page > 1 ? page - 1 : null;

  return {
    invoices: invoices.map((invoice) =>
      transformInvoice(invoice as IExternalInvoiceDocument)
    ),
    totalDocs,
    limit,
    page,
    pageCount,
    next,
    prev,
    hasPrevPage: prev !== null,
    hasNextPage: next !== null,
  };
}

const ExternalInvoiceDAO = {
  createExternalInvoice,
  getExternalInvoiceById,
  deleteExternalInvoice,
  updateExternalInvoice,
  getExternalInvoices,
};

export default ExternalInvoiceDAO;
