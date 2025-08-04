import { NextResponse, NextRequest } from "next/server";
import permissionRequired from "@/lib/decorators/permission";
import { Permission } from "@/lib/permissions/server";
import UserDAO from "@/lib/common/dao/user";
import mongoose, { Types } from "mongoose";
import Staff from "@/lib/@types/staff";
import LogDAO, { logParams } from "@/lib/common/dao/log";
import user from "@/lib/populate/user";
import { IUserDocument } from "@/lib/common/models/user";
import { EntityNotFound, buildErrorResponse } from "@/lib/errors";

type UpdateStaffBody = Partial<Staff>;

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest,
  { params }: { params: { staffId: string } }
) {
  const staffId = params.staffId;
  const result = await UserDAO.getUser(
    mongoose.Types.ObjectId.createFromHexString(staffId)
  );
  if (!result) {
    return EntityNotFound.construct("Staff", staffId);
  }
  return NextResponse.json(result);
});

export const PUT = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest,
  { params }: { params: { staffId: string } }
) {
  const staffId = params.staffId;
  const body = (await req.json()) as UpdateStaffBody;
  if (body.firstName || body.lastName) {
    return NextResponse.json(
      { message: "Cannot change a staff's name" },
      { status: 400 }
    );
  }
  try {
    const user = await UserDAO.getUser(
      mongoose.Types.ObjectId.createFromHexString(staffId)
    );
    if (!user) {
      return EntityNotFound.construct("Staff", staffId);
    }
    const details: { [key: string]: any } = {};
    for (const key of Object.keys(body) as (keyof IUserDocument)[]) {
      // @ts-ignore
      details[key] = user[key];
    }
    details.action_type = "updated";
    const staff = await UserDAO.updateUser(
      mongoose.Types.ObjectId.createFromHexString(staffId),
      body
    );
    const logDetails: logParams = {
      display: [this.user.fullName(), `${user.firstName} ${user.lastName}`],
      targetId: Types.ObjectId.createFromHexString(staff.id),
      loggerId: Types.ObjectId.createFromHexString(this.user.id),
      target: "Staff",
      details,
    };
    await LogDAO.logModification(logDetails);
    return NextResponse.json(staff);
  } catch (error) {
    return buildErrorResponse(error);
  }
});
