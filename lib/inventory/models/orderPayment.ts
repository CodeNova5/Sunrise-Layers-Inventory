import mongoose from "mongoose";
import {
  getBaseSchema,
  IBaseDocument,
  defineModel,
} from "../../common/models/base";
import { PaymentMethod, paymentMethodChoices } from "../../../lib/@types/order";
import { IUserDocument } from "../../../lib/common/models/user";
import User from "../../../lib/common/models/user";
import Order, {
  IOrderDocument,
  OrderModel,
} from "../../../lib/inventory/models/order";
import OrderItemModel from "./orderItem";
import Buyer, { IBuyerDocument } from "./buyer";

export interface IOrderPaymentDocument extends IBaseDocument {
  amount: number;
  paymentMethod: PaymentMethod;
  order: mongoose.Types.ObjectId | IOrderDocument;
  customer: mongoose.Types.ObjectId | IBuyerDocument;
  confirmedBy: mongoose.Types.ObjectId | IUserDocument;
}

const OrderPaymentSchema = getBaseSchema().add({
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    required: true,
    enum: paymentMethodChoices,
    default: "cash",
  },
  order: { type: mongoose.Types.ObjectId, required: true, ref: Order },
  customer: { type: mongoose.Types.ObjectId, required: true, ref: Buyer },
  confirmedBy: { type: mongoose.Types.ObjectId, required: true, ref: User },
});

async function updateOrderAmountPaid(
  orderId: mongoose.Types.ObjectId | IOrderDocument
) {
  const payments = await mongoose
    .model("OrderPayment")
    .find({ order: orderId._id }).select("amount").lean();
  const totalAmountPaid = payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );
  const orderItems = await OrderItemModel.find({ orderId: orderId._id })
    .select("sellingPrice qty")
    .lean();
  const subTotal = orderItems.reduce(
    (total, item) => total + item.sellingPrice * item.qty,
    0
  );
  let { status, discount: discountPercentage } = (await OrderModel.findById(
    orderId
  ).select("discount status").lean())!;
  const discount = subTotal * (discountPercentage / 100);
  const totalAmountDue = subTotal - discount;
  console.log("[*] totalAmountPaid", totalAmountPaid);
  console.log("[*] totalAmountDue", totalAmountDue);
  if (totalAmountPaid >= totalAmountDue) {
    status = "paid";
  } else if (totalAmountPaid > 0) {
    status = "ongoing";
  }
  console.log("[*] status", status);
  await mongoose
    .model("Order")
    .findByIdAndUpdate(orderId, { amountPaid: totalAmountPaid, status });
}

OrderPaymentSchema.post(
  ["save", "deleteOne", "updateOne"],
  { document: true, query: false},
  async function (doc: IOrderPaymentDocument, next) {
    console.log("[*] Updating order amount paid for order", doc.order._id.toString());
    updateOrderAmountPaid(doc.order._id);
    next();
  }
);

export const OrderPaymentModel = defineModel<IOrderPaymentDocument>(
  "OrderPayment",
  OrderPaymentSchema
);

export default OrderPaymentModel;
