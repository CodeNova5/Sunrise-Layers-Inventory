import { Schema } from 'mongoose';
import { getBaseSchema, IBaseDocument, defineModel } from '../../common/models/base';

export interface ExternalInvoiceItem {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface IExternalInvoiceDocument extends IBaseDocument {
  discount: number;
  client: {
    fullName: string;
    email: string;
    address: string;
    phone: string;
  }
  items: ExternalInvoiceItem[];
  tax: number;
  shipping: number;
  paymentMade: number;
  loggedBy: any;
  dueDate: Date;
  total(): string;
}

export const IExternalInvoiceItemSchema = new Schema<ExternalInvoiceItem>({
  name: { type: String, required: true },
  description: { type: String, required: false },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

export const ExternalInvoiceSchema = getBaseSchema().add({
  client: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  paymentMade: { type: Number, required: false, min: 0, default: 0 },
  discount: { type: Number, required: false, min: 0 },
  items: { type: [IExternalInvoiceItemSchema], required: true },
  tax: { type: Number, required: false, min: 0 },
  shipping: { type: Number, required: false, min: 0 },
  loggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
});

ExternalInvoiceSchema.methods.total = function (): string {
  const itemsTotal = this.items.reduce((sum: number, item: ExternalInvoiceItem) => sum + item.price * item.quantity, 0);
  const total = itemsTotal - this.discount + this.tax + this.shipping;
  return total.toFixed(2);
};
const ExternalInvoiceModel = defineModel<IExternalInvoiceDocument>("ExternalInvoice", ExternalInvoiceSchema);
export default ExternalInvoiceModel;
