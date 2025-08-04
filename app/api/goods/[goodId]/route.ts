import { Permission } from "@/lib/permissions/server";
import permissionRequired from "@/lib/decorators/permission";
import { NextResponse } from "next/server";
import GoodDAO from "@/lib/inventory/dao/good";
import LogDAO, { logParams } from "@/lib/common/dao/log";
import mongoose, { Types } from "mongoose";
import { EntityNotFound } from "@/lib/errors";
interface UpdateGoodBody {
  name?: string;
  costPrice?: number;
  qty?: number;
  description?: string;
  categories?: string[];
  minQty?: number;
  productId?: string;
}

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { goodId: string } }
) {
  const good = await GoodDAO.getGood(
    mongoose.Types.ObjectId.createFromHexString(params.goodId)
  );
  return NextResponse.json(good);
});

export const PUT = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { goodId: string } }
) {
  const body = (await req.json()) as UpdateGoodBody;

  const prevGood = await GoodDAO.getGood(
    mongoose.Types.ObjectId.createFromHexString(params.goodId)
  );
  if (!prevGood) {
    return EntityNotFound.construct("Good", params.goodId)
  }
  const details: { [key: string]: any } = {};
  for (const key of Object.keys(body) as (keyof UpdateGoodBody)[]) {
    details[key] = prevGood[key];
  } 
  const good = await GoodDAO.updateGood(
    mongoose.Types.ObjectId.createFromHexString(params.goodId),
    body
  );
  if (!good) {
      return EntityNotFound.construct("Good", params.goodId);
  }
  const logDetails: logParams = {
    display: [this.user.fullName(), good.name],
    targetId: Types.ObjectId.createFromHexString(good.id),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Good",
    details,
  };
  await LogDAO.logModification(logDetails);
  return NextResponse.json(good);
});

export const DELETE = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { goodId: string } }
) {
  const good = await GoodDAO.deleteGood(
    mongoose.Types.ObjectId.createFromHexString(params.goodId)
  );

  if (!good) {
    return EntityNotFound.construct("Good", params.goodId);
  }
  const logDetails: logParams = {
    display: [this.user.fullName(), good.name],
    targetId: Types.ObjectId.createFromHexString(good.id),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Good",
  };
  await LogDAO.logDeletion(logDetails);
  return new NextResponse(null, { status: 204 });
});
