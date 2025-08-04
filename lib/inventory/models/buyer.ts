import { getBaseSchema, IBaseDocument , defineModel} from '../../common/models/base';

export interface IBuyerDocument extends IBaseDocument {
  name: string;
  phone: string;
  email: string;
}

const BuyerSchema = getBaseSchema().add({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
})
export const BuyerModel = defineModel<IBuyerDocument>("Buyer", BuyerSchema);
export default BuyerModel;