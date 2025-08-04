import mongoose from "mongoose";
import OrderItemModel, { IOrderItemDocument } from "../models/orderItem";
import GoodModel from "../models/good";
import OrderModel from "../models/order";
import {
  OrderItem,
  OrderItemGood,
  OrderStatus,
  NewOrderItem,
} from "@/lib/@types/order";
import { EntityNotFound, IntegrityError } from "../../errors";

export type PopulatedGood = {
  _id: mongoose.Types.ObjectId;
  name: string;
  qty: number;
  minQty: number;
  description: string;
  productId: string;
  costPrice: number;
};

export function transformOrderItem(item: IOrderItemDocument) {
  const result = {
    id: item._id.toHexString(),
    qty: item.qty,
    goodId: item.goodId._id.toHexString(),
    good: transformOrderItemGood(item.goodId as PopulatedGood),
    orderId: item.orderId._id.toHexString(),
    costPrice: item.costPrice,
    sellingPrice: item.sellingPrice,
  } satisfies OrderItem;
  return result;
}

export function transformOrderItemGood(good: PopulatedGood) {
  const result = {
    ...good,
    status:
      good.qty > good.minQty
        ? "in-stock"
        : good.qty > 0
        ? "low-stock"
        : "out-of-stock",
  } as OrderItemGood & { _id?: mongoose.Types.ObjectId };
  //  remove the _id field
  delete result._id;
  return result as OrderItemGood;
}

async function addOrderItem(
  orderId: mongoose.Types.ObjectId | string,
  goodId: mongoose.Types.ObjectId | string,
  params: NewOrderItem
) {
  // validate the orderItem data

  const good = await GoodModel.findById(goodId);
  if (!good) {
    EntityNotFound.throw(
      "Good",
      typeof goodId === "string" ? goodId : goodId.toString()
    );
  }
  if (good.qty < params.qty) {
    IntegrityError.throw(
      "qty",
      {
        code: "not_enough_stock",
        goodId: good._id.toHexString(),
        qty: good.qty,
        requestedQty: params.qty,
      },
      "Not enough stock"
    );
  }
  const order = await OrderModel.findById(orderId);
  if (!order) {
    EntityNotFound.throw(
      "Order",
      typeof orderId === "string" ? orderId : orderId.toString()
    );
  }
  const orderItem = await OrderItemModel.create({
    ...params,
    costPrice: good.costPrice,
    orderId,
    goodId,
  });
  return transformOrderItem(orderItem);
}

async function getOrderItem(id: mongoose.Types.ObjectId | string) {
  const orderItem = await OrderItemModel.findById(id)
    .populate({
      path: "goodId",
      select: "name qty minQty description productId costPrice",
    })
    .lean();
  if (!orderItem) {
    EntityNotFound.throw(
      "OrderItem",
      typeof id === "string" ? id : id.toString()
    );
  }
  return transformOrderItem(orderItem);
}

async function getOrderItems(orderId: mongoose.Types.ObjectId | string) {
  const orderItems = await OrderItemModel.find({ orderId })
    .populate({
      path: "goodId",
      select: "name qty minQty description productId costPrice",
    })
    .lean();
  return orderItems.map(transformOrderItem);
}

async function deleteOrderItem(id: mongoose.Types.ObjectId | string) {
  const orderItem = await OrderItemModel.findById(id);
  if (!orderItem) {
    EntityNotFound.throw(
      "OrderItem",
      typeof id === "string" ? id : id.toString()
    );
  }
  await orderItem.populate("orderId", "status, _id");
  const order = orderItem.orderId as {
    status: OrderStatus;
    _id: mongoose.Types.ObjectId;
  };
  if (["pending", "paid"].includes(order.status)) {
    IntegrityError.throw(
      "orderItem",
      {
        code: "transaction_ongoing",
        orderId: order._id.toHexString(),
        orderStatus: order.status,
      },
      "Cannot delete this orderItem. A transaction is still ongoing"
    );
  }
  await orderItem.deleteOne();
  return transformOrderItem(orderItem);
}

async function updateOrderItem(
  id: mongoose.Types.ObjectId | string,
  params: OrderItem
) {
  const orderItem = await OrderItemModel.findByIdAndUpdate(id, params, {
    new: true,
  });
  if (!orderItem) {
    EntityNotFound.throw(
      "OrderItem",
      typeof id === "string" ? id : id.toString()
    );
  }
  return transformOrderItem(orderItem);
}

const OrderItemDAO = {
  addOrderItem,
  getOrderItem,
  getOrderItems,
  deleteOrderItem,
  updateOrderItem,
};
export default OrderItemDAO;
