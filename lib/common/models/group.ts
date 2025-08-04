import { getBaseSchema, IBaseDocument, defineModel } from "./base";
import User from "./user";
import mongoose from 'mongoose';
import { hasPermission } from "./utils";

export interface IGroupDocument extends IBaseDocument {
    name: string;
    description: string;
    members_ids: mongoose.Types.ObjectId[];
    permissions: {
        [key: string]: string[] | boolean;
    };
    hasPermission(permission: string): boolean;
    hasMember(userId: mongoose.Types.ObjectId): boolean;
}

export const GroupSchema = getBaseSchema().add({
    name: { type: String, required: true, unique: true},
    description: { type: String, required: false, default: '' },
    members_ids: { type: [mongoose.Types.ObjectId], required: true, default: [], ref: User },
    permissions: { type: Object, required: true, default: {} },
});

GroupSchema.methods.hasPermission = hasPermission;

GroupSchema.methods.hasMember = function (userId: mongoose.Types.ObjectId) {
    return this.members_ids.includes(userId);
};

const GroupModel = defineModel<IGroupDocument>("Group", GroupSchema);
export default GroupModel;