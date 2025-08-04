import mongoose from 'mongoose';
import { defineModel, getBaseSchema, IBaseDocument } from '../../common/models/base';
import JobModel from './job';
import MechanicModel from './mechanic';

interface IServiceDocument extends IBaseDocument {
  title: string;
  description: string;
  discount: number;
  price: number;
  isCompleted: boolean;
  jobId: mongoose.Types.ObjectId;
  mechanicId: mongoose.Types.ObjectId;
}

const ServiceSchema = getBaseSchema().add({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: String, required: true },
  isCompleted: { types: Boolean, default: Boolean},
  jobId: { type: mongoose.Types.ObjectId, required: true, ref: JobModel },
  mechanicId: { type: mongoose.Types.ObjectId, required: true, ref: MechanicModel },
});



export default defineModel<IServiceDocument>("Service", ServiceSchema);