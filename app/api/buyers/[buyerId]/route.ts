import { Buyer } from "@/lib/@types/buyer";
import permissionRequired from "@/lib/decorators/permission";
import { Permission } from "@/lib/permissions/server";
import { NextResponse } from "next/server";
import BuyerDAO from "@/lib/inventory/dao/buyer";
import mongoose, { Types } from "mongoose";
import BuyerModel, { IBuyerDocument } from "@/lib/inventory/models/buyer";
import LogDAO, { logParams } from "@/lib/common/dao/log";
import { buildErrorResponse, EntityNotFound } from "@/lib/errors";

type UpdateBuyerBody = Partial<Buyer>;

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { buyerId: string } }
) {
  try {
    const buyer = await BuyerDAO.getBuyer(
      mongoose.Types.ObjectId.createFromHexString(params.buyerId)
    );
    return NextResponse.json(buyer);
  } catch (error) {
    return buildErrorResponse(error);
  }
});

export const PUT = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { buyerId: string } }
) {
  const body = (await req.json()) as UpdateBuyerBody;
  if (body.name) {
    return NextResponse.json(
      { message: "Cannot change a buyer's name" },
      { status: 400 }
    );
  }
  const buyer = await BuyerModel.findById(
    mongoose.Types.ObjectId.createFromHexString(params.buyerId)
  );
  if (!buyer) {
    return EntityNotFound.construct("Customer", params.buyerId);
  }
  const details: { [key: string]: any } = {};
  for (const key of Object.keys(body) as (keyof IBuyerDocument)[]) {
    details[key] = buyer[key];
  }
  Object.assign(buyer, body);
  await buyer.save();
  const logDetails: logParams = {
    display: [this.user.fullName(), buyer.name],
    targetId: Types.ObjectId.createFromHexString(buyer.id),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Buyer",
    details,
  };
  await LogDAO.logModification(logDetails);
  return NextResponse.json(buyer);
});

export const DELETE = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { buyerId: string } }
) {
  try {
    const buyer = await BuyerDAO.deleteBuyer(
      mongoose.Types.ObjectId.createFromHexString(params.buyerId)
    );
    const logDetails: logParams = {
      display: [this.user.fullName(), buyer.name],
      targetId: Types.ObjectId.createFromHexString(params.buyerId),
      loggerId: Types.ObjectId.createFromHexString(this.user.id),
      target: "Buyer",
    };
    await LogDAO.logDeletion(logDetails);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return buildErrorResponse(error);
  }
});
