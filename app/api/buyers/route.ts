import { Permission } from "@/lib/permissions/server";
import { IGoodDocument } from "@/lib/inventory/models/good";
import permissionRequired from "@/lib/decorators/permission";
import { NextResponse } from "next/server";
import { FilterQuery, Types } from "mongoose";
import BuyerDAO from "@/lib/inventory/dao/buyer";
import { Buyer } from "@/lib/@types/buyer";
import LogDAO, { logParams } from "@/lib/common/dao/log";

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req
) {
  const rawLimit = req.nextUrl.searchParams.get("l");
  const limit = rawLimit ? parseInt(rawLimit) : 10;
  const rawPage = req.nextUrl.searchParams.get("p");
  const page = rawPage ? parseInt(rawPage) : 1;
  const search = (req.nextUrl.searchParams.get("q") as string | null) || "";
  const query: FilterQuery<IGoodDocument> = {};
  if (search.includes(" ")) {
    const [firstName, lastName, ...rest] = search.split(" ");
    query.$and = [
      { name: { $regex: firstName, $options: "i" } },
      { name: { $regex: lastName, $options: "i" } },
    ];
  } else {
    query.$or = [
      { id: search },
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const results = await BuyerDAO.getBuyers({ filters: query, page, limit });
  return NextResponse.json(results);
});


export const POST = permissionRequired(Permission.AllowAny())(async function (
  req
) {
  const body = (await req.json()) as Buyer;

  const buyer =  (await BuyerDAO.addBuyer(body)) as Buyer;
  const logDetails: logParams = {
    display: [this.user.fullName(), buyer.name], 
    targetId: Types.ObjectId.createFromHexString(buyer.id),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Buyer",
  }
  await LogDAO.logCreation(logDetails);
  return NextResponse.json(buyer, { status: 201 });
});