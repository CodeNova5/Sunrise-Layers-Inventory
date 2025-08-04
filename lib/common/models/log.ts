import mongoose from 'mongoose';
import { getBaseSchema, IBaseDocument, defineModel } from './base';
import UserModel from './user';

export interface ILogDocument extends IBaseDocument {
  display: string[];
  action: 'create' | 'update' | 'delete'; // The action carried out
  target: string; // The model affected
  details: {
    [key: string]: any
  }, // Any additional details
  targetId: mongoose.Types.ObjectId; // The id of the model affected
  loggerId: mongoose.Types.ObjectId; // The id of the user who carried the action

}

const LogSchema = getBaseSchema().add({
  display: { type: Array, required: true, default: ''},
  action: { type: String, required: true },
  details: { type: Object, required: false},
  target: { type: String, required: true },
  targetId: { type: mongoose.Types.ObjectId, required: true },
  loggerId: { type: mongoose.Types.ObjectId, required: true, ref: UserModel },
});


const LogModel = defineModel<ILogDocument>("Log", LogSchema);
export default LogModel;