import mongoose from 'mongoose';
import { getBaseSchema, IBaseDocument, defineModel } from '../../common/models/base';
import CustomerModel from './customer';
import VehicleModel from './vehicle';

interface IJobDocument extends IBaseDocument {
  title: string;
  description: string;
  discount: number;
  customerId: mongoose.Types.ObjectId;
}

const JobSchema = getBaseSchema().add({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: String, required: true },
  customerId: { type: mongoose.Types.ObjectId, required: true, ref: CustomerModel},
  vehicleId: { type: mongoose.Types.ObjectId, required: true, ref: VehicleModel},
});



export default defineModel<IJobDocument>("Job", JobSchema);