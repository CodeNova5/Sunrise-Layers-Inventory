import mongoose, { FilterQuery } from "mongoose";
import { IOrderDocument, OrderModel } from "../models/order";
import {
  NewOrder,
  NewOrderItem,
  Order,
  OrderItem,
  OrderModification,
  OrderSort,
  OrderSummary,
  PaginatedOrders,
} from "@/lib/@types/order";
import OrderItemDAO from "./orderItem";
import OrderPaymentDAO from "./orderPayment";
import { DocumentOrId } from "@/lib/@types";
import { IUserDocument } from "@/lib/common/models/user";
import { EntityNotFound, IntegrityError, PageNotFound, ValidationError, ValueError } from "../../errors";

type PopulatedBuyer = {
  name: string;
  email: string;
  phone: string;
  _id: mongoose.Types.ObjectId;
};

function transformOrder(order: IOrderDocument) {
  const result = {
    items: [],
    status: order.status,
    orderNo: order.orderNo,
    discount: order.discount,
    amountPaid: order.amountPaid,
    id: order._id.toHexString(),
    cancelReason: order.cancelReason,
    createdAt: order.createdAt.toISOString(),
    overdueLimit: order.overdueLimit.toISOString(),
  } satisfies Omit<Order, "buyer" | "buyerId" | "payments">;
  return result;
}

function transformBuyer(buyer: PopulatedBuyer) {
  return {
    buyerId: buyer._id.toHexString(),
    buyer: {
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      id: buyer._id.toHexString(),
    },
  };
}

function summarizeOrder(order: Order): OrderSummary {
  const totalCost = order.items.reduce((acc, item) => {
    return acc + item.costPrice * item.qty;
  }, 0);
  const totalAmount = order.items.reduce((acc, item) => {
    return acc + item.sellingPrice * item.qty;
  }, 0);
  const orderSummary = {
    ...order,
    totalCost,
    totalAmount,
    numItems: order.items.length,
  } as OrderSummary & { items?: OrderItem[] };
  delete orderSummary.items;
  return orderSummary;
}

async function addOrder(
  order: NewOrder & {
    staff: DocumentOrId<IUserDocument>;
  }
): Promise<Order> {
  const createdAt = new Date(order.createdAt);
  const overdueLimit = new Date(order.overdueLimit);
  // validate the order data

  const buyerId = new mongoose.Types.ObjectId(order.buyerId);
  const newOrder = await OrderModel.create({
    ...order,
    createdAt,
    overdueLimit,
    buyerId,
  });
  const items = await Promise.all(
    order.items.map((item) => {
      const goodId = new mongoose.Types.ObjectId(item.goodId);
      return OrderItemDAO.addOrderItem(newOrder._id, goodId, item);
    })
  );
  await Promise.all(
    order.payments?.map((payment) => {
      return OrderPaymentDAO.createOrderPayment(newOrder, {
        ...payment,
        customer: order.buyerId,
        confirmedBy:
          typeof order.staff === "string"
            ? order.staff
            : order.staff._id.toHexString(),
      });
    }) ?? []
  );
  await newOrder.populate({
    path: "buyerId",
    select: "name email _id phone",
  });
  return {
    ...transformBuyer(newOrder.buyerId as PopulatedBuyer),
    ...transformOrder(newOrder),
    items,
  };
}

async function updateOrder(update: OrderModification): Promise<Order> {
  // Validate the order data
  const order = await OrderModel.findByIdAndUpdate(
    update.id,
    {
      ...update,
      buyerId: new mongoose.Types.ObjectId(update.buyerId),
    },
    { new: true }
  );
  if (!order) {
    EntityNotFound.throw("Order", update.id);
  }
  const items = await Promise.all(
    update.items.map(async (item: OrderItem | NewOrderItem) => {
      const goodId = new mongoose.Types.ObjectId(item.goodId);
      if ("id" in item) {
        return await OrderItemDAO.updateOrderItem(item.id, item);
      } else {
        return await OrderItemDAO.addOrderItem(order._id, goodId, item);
      }
    })
  );
  order.populate({
    path: "buyerId",
    select: "name email _id phone",
  });
  return {
    ...transformBuyer(order.buyerId as PopulatedBuyer),
    ...transformOrder(order),
    items,
  };
}

async function deleteOrder(id: mongoose.Types.ObjectId) {
  const order = await OrderModel.findById(id);
  if (!order) {
    EntityNotFound.throw("Order", id.toString());
  }
  if (["pending", "paid"].includes(order.status)) {
    IntegrityError.throw(
      "Cannot delete this order. A transaction is still ongoing",
      {
        code: "order_has_transaction",
        order_id: id.toString(),
      }
    );
  }
  await order.deleteOne();
  return order;
}

async function getOrder(
  id?: mongoose.Types.ObjectId | string,
  filters?: FilterQuery<Order>
) {
  let query = {};
  if (id) query = { _id: id };
  if (filters) query = { ...query, ...filters };
  if (!id && !filters) {
    ValueError.throw("id or filters must be provided");
  }
  const order = await OrderModel.findOne(query).lean().populate({
    path: "buyerId",
    select: "name email _id phone",
  });
  if (!order) {
    EntityNotFound.throw("Order", query);
  }
  return {
    ...transformBuyer(order.buyerId as PopulatedBuyer),
    ...transformOrder(order),
    items: await OrderItemDAO.getOrderItems(order._id),
  };
}

async function getOrders({
  page = 1,
  limit = 10,
  filters,
  sort,
}: {
  page: number;
  limit: number;
  filters?: FilterQuery<Order>;
  sort: OrderSort;
}): Promise<PaginatedOrders> {
  if (page < 1) {
    PageNotFound.throw(page, "Order", { query: filters, limit });
  }
  if (limit < 1) {
    PageNotFound.throw(page, "Order", { query: filters, limit });
  }

  const query = { ...filters } as FilterQuery<Order>;
  const totalDocs = await OrderModel.countDocuments(query).exec();
  const pageCount = Math.ceil(totalDocs / limit);
  if (page > 1 && page > pageCount) {
    PageNotFound.throw(page, "Order", { query: filters, limit });
  }
  const skip = (page - 1) * limit;
  const orders = await OrderModel.find(query)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .populate({
      path: "buyerId",
      select: "name email _id phone",
    })
    .lean()
    .exec();
  const next = orders.length === limit ? page + 1 : null;
  const prev = page > 1 ? page - 1 : null;
  const transformedAndSummarizedOrders = await Promise.all(
    orders.map(async (order): Promise<OrderSummary> => {
      return summarizeOrder({
        ...transformBuyer(order.buyerId as PopulatedBuyer),
        ...transformOrder(order),
        items: await OrderItemDAO.getOrderItems(order._id),
      });
    })
  );
  return {
    orders: transformedAndSummarizedOrders,
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

const OrderDAO = {
  addOrder,
  updateOrder,
  deleteOrder,
  getOrder,
  getOrders,
};
export default OrderDAO;
