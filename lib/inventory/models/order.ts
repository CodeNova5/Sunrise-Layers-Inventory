import mongoose from 'mongoose';
import { getBaseSchema, IBaseDocument , defineModel} from '../../common/models/base';
import { BuyerModel, IBuyerDocument } from './buyer';
import { OrderStatus, orderStatusChoices, paymentMethodChoices } from '../../../lib/@types/order';
import GoodModel from './good';


export interface IOrderDocument extends IBaseDocument {
  orderNo: number;
  discount: number;
  overdueLimit: Date;
  amountPaid: number;
  status: OrderStatus;
  cancelReason: string | null;
  buyerId: mongoose.Types.ObjectId | IBuyerDocument;
}

const OrderSchema = getBaseSchema().add({
  overdueLimit: { type: Date, required: true },
  cancelReason: { type: String, required: false },
  discount: { type: Number, required: true, default: () => 0 },
  amountPaid: { type: Number, required: true, default: () => 0 },
  orderNo: { type: Number, required: true, default: () => 0 },
  buyerId: { type: mongoose.Types.ObjectId, required: true, ref: BuyerModel },
  status: { type: String, required: true, enum: orderStatusChoices, default: 'pending' },
})

OrderSchema.pre("save", async function (next) {
  console.log("ORDER PRE SAVE HOOK");
  if (this.isNew) {
    const lastOrder = await OrderModel.findOne({}, {}, { sort: { orderNo: -1 } });
    this.$set("orderNo", lastOrder ? lastOrder.orderNo + 1 : 1);
  } else {
    const original = await OrderModel.findById(this._id);
    // @ts-ignore
    this._originalStatus = original.status;
  }
  next();
});

OrderSchema.post("save", async function (doc: IOrderDocument, next) {
  try {
    const OrderItemModel = (await import("./orderItem")).default;
    //@ts-ignore
    if (doc.status === "cancelled" && doc._originalStatus !== "cancelled") {
      const orderItems = await OrderItemModel.find({ orderId: doc._id });
      for (const item of orderItems) {
        console.log(`Restoring good quantity (${item.qty}) for ${item.goodId}`);
        await GoodModel.findByIdAndUpdate(item.goodId, {
          $inc: { qty: item.qty },
        });
      }
    }
    next();
  } catch (error) {
    // @ts-ignore
    next(error);
  }
});


OrderSchema.post("deleteOne", { document: true, query: false }, async function (doc, next) {
  try {
    const OrderItemModel = (await import("./orderItem")).default;
    const orderItems = await OrderItemModel.find({ orderId: doc._id }).exec();
    for (const item of orderItems) {
      await item.deleteOne();
    }
  } catch (error) {
    // @ts-ignore
    next(error);
  }
});

export const OrderModel = defineModel<IOrderDocument>("Order", OrderSchema);
export default OrderModel;
export {
  orderStatusChoices,
  paymentMethodChoices,
}