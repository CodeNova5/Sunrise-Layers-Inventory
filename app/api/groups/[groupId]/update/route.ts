import { NextResponse, NextRequest } from "next/server";
import permissionRequired from "@/lib/decorators/permission";
import { Permission } from "@/lib/permissions/server";
import GroupModel, { IGroupDocument } from '@/lib/common/models/group'
import LogDAO, { logParams } from "@/lib/common/dao/log";
import mongoose, { Types } from "mongoose";
import Group from "@/lib/@types/group";
import { buildErrorResponse, EntityNotFound } from "@/lib/errors";

export const POST = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { name, description, permissions } = await req.json() as Group;
    const groupId = mongoose.Types.ObjectId.createFromHexString(params.groupId);
    const updateFields: Partial<Group> = {};
  if (name !== undefined) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (permissions !== undefined) updateFields.permissions = permissions;
    const group = await GroupModel.findOneAndUpdate(
        { _id: groupId },
        { $set: updateFields },
        { new: false }
      );
    if (!group) {
        return EntityNotFound.construct("Group", groupId.toHexString());
    }
    const details: any = { action_type: "updated" };
    for (const key of Object.keys(updateFields)) {
      details[key] = group[key as keyof IGroupDocument];
    }
    const logDetails: logParams = {
      display: [this.user.fullName(), group.name],
      targetId: Types.ObjectId.createFromHexString(params.groupId),
      loggerId: Types.ObjectId.createFromHexString(this.user.id),
      target: "Group",
      details
    };
  
    await LogDAO.logModification(logDetails);
    return NextResponse.json({ message: "Role successfully updated" }, { status: 200 });
  } catch (error) {
    console.error('Error updating group:', error);
    return buildErrorResponse(error);
  }
});
