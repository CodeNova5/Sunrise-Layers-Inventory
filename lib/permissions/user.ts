import { Permission } from "./server";
import { IUserDocument } from "../common/models/user";
import Group from "../common/models/group";

const isGroupMember = (groupName: string) => {
    return Permission.create({
        hasPermission: async (user: IUserDocument, request) => {
            const group = await Group.findOne({ name: groupName });
            if (!group) {
                return false;
            }
            return group.hasMember(user._id);
        },
    });
}

const hasPermission = (permission: string) => {
    return Permission.create({
        async hasPermission(user: IUserDocument, request): Promise<boolean> {
            if (user.hasPermission(permission)) {
                return true;
            }
            const userGroups = await Group.find({ members_ids: user._id });
            for (const group of userGroups) {
                if (group.hasPermission(permission)) {
                    return true;
                }
            }
            return false;
        }
    });
}

const isAdmin = isGroupMember('admin');
const isOwner = isGroupMember('owner');
const isTeller = isGroupMember('teller');
const isMechanic = isGroupMember('mechanic');
const isBanned = Permission.create({
    async hasPermission(user: IUserDocument, request): Promise<boolean> {
        return user.status !== 'banned';
    },
});

export {
    isAdmin,
    isOwner,
    isBanned,
    isTeller,
    isMechanic,
    isGroupMember,
    hasPermission
};