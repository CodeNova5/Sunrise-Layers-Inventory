import { NextRequest, NextResponse } from "next/server";
import permissionRequired from "@/lib/decorators/permission";
import { Permission } from "@/lib/permissions/server";
import Group from "@/lib/common/models/group";

interface GroupResponse {
  id: string;
  name: string;
  permissions: {
    [scope: string]: string[] | boolean;
  };
  description: string;
  members: string[]
}

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest
) {
  const user = this.user;
  const response: GroupResponse[] = (await Group.find()).map((group) => ({
    id: group.id,
    name: group.name,
    permissions: group.permissions,
    members: group.members_ids.map(id => id.toString()),
    description: group.description,
  }));
  return NextResponse.json(response);
});
