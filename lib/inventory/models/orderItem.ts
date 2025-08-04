import mongoose from "mongoose";
import {
  getBaseSchema,
  IBaseDocument,
  defineModel,
} from "../../common/models/base";
import { GoodModel, IGoodDocument } from "./good";
import { OrderModel, IOrderDocument } from "./order";

export interface IOrderItemDocument extends IBaseDocument {
  qty: number;
  costPrice: number; // The current cost price per unit as at creation of the invoice
  sellingPrice: number; // Per unit
  orderId: mongoose.Types.ObjectId | IOrderDocument;
  goodId: mongoose.Types.ObjectId | IGoodDocument;
}

const OrderItemSchema = getBaseSchema().add({
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  qty: { type: Number, required: true, default: () => 1 },
  goodId: { type: mongoose.Types.ObjectId, required: true, ref: GoodModel },
  orderId: { type: mongoose.Types.ObjectId, required: true, ref: OrderModel },
});

OrderItemSchema.pre("save", async function (next) {
  // Get the original quantity of the order item
  if (!this.isNew) {
    const original = await OrderItemModel.findById(this._id);
    // @ts-ignore
    this._originalQty = original.qty;
  }
  next();
});

OrderItemSchema.post("save", async function (doc: IOrderItemDocument, next) {
  try {
    // @ts-ignore
    const qtyDifference = doc.qty - (doc._originalQty || 0);
    console.log(`Reducing good quantity by ${qtyDifference}`);
    await GoodModel.findByIdAndUpdate(doc.goodId, {
      $inc: { qty: -qtyDifference },
    });
    console.log("Order item saved successfully.");
    next();
  } catch (error) {
    console.error("Error saving order item:", error);
    // @ts-ignore
    next(error);
  }
});

OrderItemSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const doc = this as any;
      const orderItem = await OrderItemModel.findById(doc._id);
      // @ts-ignore
      doc._originalQty = orderItem.qty;
      next();
    } catch (error) {
      // @ts-ignore
      next(error);
    }
  }
);

// Middleware to increment good quantity after deletion
OrderItemSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc: IOrderItemDocument, next) {
    try {
      // @ts-ignore
      const qtyDifference = doc._originalQty;
      console.assert(qtyDifference, "Original quantity not found");
      console.log(
        `Restoring good '${doc.goodId}' quantity by ${qtyDifference}`
      );
      await GoodModel.findByIdAndUpdate(doc.goodId, {
        // @ts-ignore
        $inc: { quantity: qtyDifference },
      });
      next();
    } catch (error) {
      // @ts-ignore
      next(error);
    }
  }
);

export const OrderItemModel = defineModel<IOrderItemDocument>(
  "OrderItem",
  OrderItemSchema
);
export default OrderItemModel;
