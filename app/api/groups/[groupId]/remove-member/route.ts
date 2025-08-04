import { NextResponse, NextRequest } from "next/server";
import permissionRequired from "@/lib/decorators/permission";
import { Permission } from "@/lib/permissions/server";
import GroupDAO from "@/lib/common/dao/group";
import LogDAO, { logParams } from "@/lib/common/dao/log";
import mongoose, { Types } from "mongoose";
import { getDocument } from "@/lib/common/dao/base";

interface GroupChange {
  staffId: string;
}
export const POST = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const groupId = params.groupId;
  const { staffId } = (await req.json()) as GroupChange;
  if (!staffId) {
    return NextResponse.json(
      { message: "Staff ID is required" },
      { status: 400 }
    );
  }
  const { group, user } = await GroupDAO.removeMember(
    mongoose.Types.ObjectId.createFromHexString(groupId),
    mongoose.Types.ObjectId.createFromHexString(staffId)
  );
  const logDetails: logParams = {
    display: [this.user.fullName(), user.fullName(), group.name],
    targetId: Types.ObjectId.createFromHexString(groupId),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Group",
    details: {
      action_type: "removed"
    },
  };
  await LogDAO.logModification(logDetails);
  return NextResponse.json({ message: "Member removed successfully" });
});
