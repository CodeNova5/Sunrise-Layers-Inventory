import { Permission } from "@/lib/permissions/server";
import Good, { IGoodDocument } from "@/lib/inventory/models/good";
import permissionRequired from "@/lib/decorators/permission";
import { NextResponse } from "next/server";
import GoodDAO from "@/lib/inventory/dao/good";
import LogDAO, { logParams } from "@/lib/common/dao/log";
import { Types } from "mongoose";

interface CreateGoodBody {
  name: string;
  costPrice: number;
  qty: number;
  description: string;
  categories: string[];
  minQty: number;
  productId: string;
}

export const POST = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { goodId: string } }
) {
  const body = (await req.json()) as CreateGoodBody;
  const good = await GoodDAO.addGood(body);
  const logDetails: logParams = {
    display: [this.user.fullName(), good.name], 
    targetId: Types.ObjectId.createFromHexString(good.id),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Good",
  }
  await LogDAO.logCreation(logDetails);
  return NextResponse.json(good, { status: 201 });
});
