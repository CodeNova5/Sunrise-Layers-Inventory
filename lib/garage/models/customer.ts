import mongoose from 'mongoose';
import { getBaseSchema, IBaseDocument , defineModel} from '../../common/models/base';

interface ICustomerDocument extends IBaseDocument {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const CustomerSchema = getBaseSchema().add({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
});
CustomerSchema.methods.fullName = function() {
  return this.firstName + ' ' + this.lastName;

}
export default defineModel<ICustomerDocument>("Customer", CustomerSchema);