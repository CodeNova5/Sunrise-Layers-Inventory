import mongoose from 'mongoose';
import { defineModel, getBaseSchema, IBaseDocument } from '../../common/models/base';

interface IMechanicDocument extends IBaseDocument {
  name: string;
  phoneNumber: string;
}

const MechanicSchema = getBaseSchema().add({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});



export default defineModel<IMechanicDocument>("Mechanic", MechanicSchema);