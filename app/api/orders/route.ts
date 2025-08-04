import { NextRequest, NextResponse } from "next/server";
import permissionRequired from "@/lib/decorators/permission";
import { Permission } from "@/lib/permissions/server";
import { IOrderDocument } from "@/lib/inventory/models/order";
import qs from "qs";
import { Order, OrderStatus, PaymentMethod, OrderSort, NewOrder } from "@/lib/@types/order";
import { FilterQuery, Types } from "mongoose";
import OrderDAO from "@/lib/inventory/dao/order";
import LogDAO, { logParams } from "@/lib/common/dao/log";

type HasMinMax = Partial<{
  gte: string;
  lte: string;
}>;

type HasBeforeAfter = Partial<{
  before: string;
  after: string;
}>;

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest
) {
  const params = qs.parse(req.nextUrl.searchParams.toString());
  const page = params.page ? parseInt(params.page as string) : 1;
  const limit = params.limit ? parseInt(params.limit as string) : 10;
  const search = params.q?.toString().trim() as string | undefined;
  const status = params.s?.toString().trim() as OrderStatus | undefined;
  const items = params.items as string[] | undefined;
  const method = params.method?.toString().trim() as PaymentMethod | undefined;
  const cost = params.cost as HasMinMax | undefined;
  const discount = params.discount as HasMinMax | undefined;
  const paid = params.paid as HasMinMax | undefined;
  const overdue = params.overdue as HasBeforeAfter | undefined;
  const created = params.created as HasBeforeAfter | undefined;
  let sort: OrderSort = {};
  if (params.sort) {
    Object.keys(params.sort).forEach((key) => {
      sort[key as keyof OrderSort] = parseInt(
        (params.sort as Record<keyof OrderSort, "-1" | "1">)[key as keyof OrderSort]
      ) as -1 | 1;
    });
  }
  const query: FilterQuery<IOrderDocument> = {};
  if (search) {
    // implement customer search and order id search
  }
  if (status) {
    query.status = status;
  }
  if (items) {
    // implement goods filter
  }
  if (method) {
    query.paymentMethod = method;
  }
  if (cost) {
    // implement cost filter by calculating cost of order items
  }
  if (discount) {
    query.discount = {};
    discount.lte && (query.discount.$lte = parseFloat(discount.lte));
    discount.gte && (query.discount.$gte = parseFloat(discount.gte));
  }
  if (paid) {
    query.amountPaid = {};
    paid.lte && (query.amountPaid.$lte = parseFloat(paid.lte));
    paid.gte && (query.amountPaid.$gte = parseFloat(paid.gte));
  }
  if (overdue) {
    query.overdueLimit = {};
    overdue.after && (query.overdueLimit.$gte = new Date(overdue.after));
    overdue.before && (query.overdueLimit.$lte = new Date(overdue.before));
  }
  if (created) {
    query.createdAt = {};
    created.after && (query.createdAt.$gte = new Date(created.after));
    created.before && (query.createdAt.$lte = new Date(created.before));
  }
  const response = await OrderDAO.getOrders({
    filters: query,
    sort: sort,
    page: page,
    limit: limit,
  });
  return NextResponse.json(response);
});


export const POST = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest
) {
  const order = await req.json() as NewOrder;
  const response = await OrderDAO.addOrder({...order, staff: this.user});
  const logDetails: logParams = {
    display: [this.user.fullName(), response.orderNo.toString()], 
    targetId: Types.ObjectId.createFromHexString(response.id),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Order",
  }
  await LogDAO.logCreation(logDetails);
  return NextResponse.json(response, { status: 201 });
});