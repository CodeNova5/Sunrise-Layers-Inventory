import mongoose from "mongoose";
import Group, { IGroupDocument } from "../models/group";
import User, { IUserDocument } from "../models/user";
import { ObjectOrId, getDocument } from "./base";
import { EntityNotFound, IntegrityError } from "../../errors";

interface createGroupParams {
  name: string;
  description?: string;
}

async function createGroup({ name, description }: createGroupParams) {
  const group = new Group({
    name,
    description,
  });
  await group.save();
  return group;
}

async function updateGroup(
  groupId: ObjectOrId<IGroupDocument>,
  data: Partial<createGroupParams>
) {
  const group = await getDocument<IGroupDocument>(Group, groupId);
  if (!group) {
    EntityNotFound.throw(
      "Group",
      typeof groupId === "string" ? groupId : groupId._id.toString()
    );
  }
  Object.assign(group, data);
  await group.save();
}

async function deleteGroup(id: mongoose.Types.ObjectId) {
  await Group.deleteOne({ _id: id });
}

async function addMember(
  groupId: ObjectOrId<IGroupDocument>,
  userId: ObjectOrId<IUserDocument>
) {
  const group = await getDocument<IGroupDocument>(Group, groupId);
  if (!group) {
    EntityNotFound.throw(
      "Group",
      typeof groupId === "string" ? groupId : groupId._id.toString()
    );
  }
  const user = await getDocument<IUserDocument>(User, userId);
  if (!user) {
    EntityNotFound.throw(
      "User",
      typeof userId === "string" ? userId : userId._id.toString()
    );
  }
  if (group.members_ids.includes(user._id)) {
    IntegrityError.throw("User already in group", {
      code: "user_already_in_group",
      user_id: user._id.toString(),
      group_id: group._id.toString(),
    });
  }
  group.members_ids.push(user._id);
  await group.save();
  return { group, user };
}

async function removeMember(
  groupId: ObjectOrId<IGroupDocument>,
  userId: ObjectOrId<IUserDocument>
) {
  const group = await getDocument<IGroupDocument>(Group, groupId);
  if (!group) {
    EntityNotFound.throw(
      "Group",
      typeof groupId === "string" ? groupId : groupId._id.toString()
    );
  }
  const user = await getDocument<IUserDocument>(User, userId);
  if (!user) {
    EntityNotFound.throw(
      "User",
      typeof userId === "string" ? userId : userId._id.toString()
    );
  }
  if (!group.members_ids.includes(user._id)) {
    IntegrityError.throw("User not in group", {
      code: "user_not_in_group",
      user_id: user._id.toString(),
      group_id: group._id.toString(),
    });
  }
  group.members_ids = group.members_ids.filter((id) => !id.equals(user._id));
  await group.save();
  return { group, user };
}

async function setPermission(
  groupId: ObjectOrId<IGroupDocument>,
  ...permissions: {
    scope: string;
    actions: string[] | boolean;
    merge: boolean;
  }[]
) {
  const group = await getDocument<IGroupDocument>(Group, groupId);
  if (!group) {
    EntityNotFound.throw(
      "Group",
      typeof groupId === "string" ? groupId : groupId._id.toString()
    );
  }
  permissions.forEach(({ scope, actions, merge }) => {
    if (typeof actions === "boolean") {
      group.permissions[scope] = actions;
    } else if (merge) {
      if (typeof group.permissions[scope] === "boolean") {
        group.permissions[scope] = actions;
      } else {
        const uniqueActions = new Set([
          ...(group.permissions[scope] as string[]),
          ...actions,
        ]);
        group.permissions[scope] = Array.from(uniqueActions);
      }
    } else {
      group.permissions[scope] = actions;
    }
  });
  await group.save();
}

const GroupDAO = {
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  setPermission,
};

export default GroupDAO;
