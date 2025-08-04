import { getBaseSchema, IBaseDocument, defineModel } from './base';
import { hasPermission } from './utils';

export interface IUserDocument extends IBaseDocument {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  status: 'active' | 'banned';
  permissions: {
    [key: string]: string[] | boolean;
  };
  fullName(): string;
  hasPermission(permission: string): boolean;
}

export const UserSchema = getBaseSchema().add({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: false },
  email: { type: String, required: true},
  password: { type: String, required: true },
  permissions: { type: Object, required: true, default: {} },
  status: { type: String, required: true, enum: ['active', 'banned'], default: 'active' },
});

UserSchema.methods.fullName = function() {
  return this.firstName + ' ' + this.lastName;
}

UserSchema.methods.hasPermission = hasPermission;

const UserModel = defineModel<IUserDocument>("User", UserSchema);
export default UserModel;