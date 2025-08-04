import { NextResponse } from "next/server";
import permissionRequired from "@/lib/decorators/permission";
import { Permission } from "@/lib/permissions/server";
import {UpdateUser, type User} from "@/lib/@types/user";
import Group, { IGroupDocument } from "@/lib/common/models/group";
import { UserDAO } from "@/lib/common/dao";
import { EntityNotFound } from "@/lib/errors";
import mongoose from "mongoose";

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req
) {
  const user = this.user;
  const groups = await Group.find(
    { members_ids: user._id, isDeleted: false },
    {
      _id: 1,
      name: 1,
      permissions: 1,
    }
  );
  const response: User = {
    id: user._id.toString(),
    email: user.email,
    lastName: user.lastName,
    firstName: user.firstName,
    phone: user.phone.replace("+234", "0"),
    permissions: user.permissions,
    groups: groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      permissions: group.permissions,
    })),
  };
  return NextResponse.json(response);
});

export const POST = permissionRequired(Permission.AllowAny())(async function (
  req
) {
  const payload: UpdateUser = await req.json();
  const user = await UserDAO.updateUser(this.user._id, payload);
  return NextResponse.json(user);
});