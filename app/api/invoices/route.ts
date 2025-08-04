import { Permission } from "@/lib/permissions/server";
import permissionRequired from "@/lib/decorators/permission";
import { NextResponse, NextRequest } from "next/server";
import { FilterQuery } from "mongoose";
import qs from "qs";
import { IExternalInvoiceDocument } from "@/lib/inventory/models/externalInvoice";
import ExternalInvoiceDAO from "@/lib/inventory/dao/externalInvoice";
import LogDAO, { logParams } from "@/lib/common/dao/log";
import { Types } from "mongoose";
import {
  NewExternalInvoice,
} from "@/lib/@types/invoice";

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest
) {
  const params = qs.parse(req.nextUrl.searchParams.toString());
  const limit = params.l ? parseInt(params.l as string) : 10;
  const page = params.p ? parseInt(params.p as string) : 1;
  const query = params.q?.toString().trim();
  const loggedBy = params.loggedBy as string | undefined;
  const tax = params.tax as { gte?: string; lte?: string } | undefined;
  const discount = params.discount as
    | { gte?: string; lte?: string }
    | undefined;
  const payment = params.payment as { gte?: string; lte?: string } | undefined;
  const dueDate = params.dueDate as
    | { before?: string; after?: string }
    | undefined;
  const created = params.created as
    | { before?: string; after?: string }
    | undefined;

  const filterQuery: FilterQuery<IExternalInvoiceDocument> = {};

  if (query) {
    filterQuery.$or = [
      { "client.fullName": { $regex: query, $options: "i" } },
      { "client.email": { $regex: query, $options: "i" } },
      { "items.name": { $regex: query, $options: "i" } },
    ];
  }

  if (loggedBy) {
    filterQuery.loggedBy = Types.ObjectId.createFromHexString(loggedBy);
  }

  if (tax) {
    filterQuery.tax = {};
    tax.gte && (filterQuery.tax.$gte = parseFloat(tax.gte));
    tax.lte && (filterQuery.tax.$lte = parseFloat(tax.lte));
  }

  if (discount) {
    filterQuery.discount = {};
    discount.gte && (filterQuery.discount.$gte = parseFloat(discount.gte));
    discount.lte && (filterQuery.discount.$lte = parseFloat(discount.lte));
  }

  if (payment) {
    filterQuery.paymentMade = {};
    payment.gte && (filterQuery.paymentMade.$gte = parseFloat(payment.gte));
    payment.lte && (filterQuery.paymentMade.$lte = parseFloat(payment.lte));
  }

  if (dueDate) {
    filterQuery.dueDate = {};
    dueDate.after && (filterQuery.dueDate.$gte = new Date(dueDate.after));
    dueDate.before && (filterQuery.dueDate.$lte = new Date(dueDate.before));
  }

  if (created) {
    filterQuery.createdAt = {};
    created.after && (filterQuery.createdAt.$gte = new Date(created.after));
    created.before && (filterQuery.createdAt.$lte = new Date(created.before));
  }

  const results = await ExternalInvoiceDAO.getExternalInvoices({
    filters: filterQuery,
    page,
    limit,
  });
  return NextResponse.json(results);
});

export const POST = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest
) {
  const invoice = (await req.json()) as NewExternalInvoice;
  const response = await ExternalInvoiceDAO.createExternalInvoice({
    ...invoice,
    loggedBy: Types.ObjectId.createFromHexString(this.user.id),
  });

  const logDetails: logParams = {
    display: [this.user.fullName(), response.id],
    targetId: Types.ObjectId.createFromHexString(response.id),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Invoice",
  };
  await LogDAO.logCreation(logDetails);

  return NextResponse.json(response, { status: 201 });
});
