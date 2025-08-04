import mongoose from 'mongoose';
import { defineModel, getBaseSchema, IBaseDocument } from '../../common/models/base';
import CustomerModel from './customer';

interface IVehicleDocument extends IBaseDocument {
  carModel: string;
  name: string;
  plateNumber: number;
  year: number;
  customerId: mongoose.Types.ObjectId;
}

const VehicleSchema = getBaseSchema().add({
  carModel: { type: String, required: true },
  name: { type: String, required: true },
  plateNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  customerId: { type: mongoose.Types.ObjectId, required: true, ref: CustomerModel},
});


export default defineModel<IVehicleDocument>("Vehicle", VehicleSchema);