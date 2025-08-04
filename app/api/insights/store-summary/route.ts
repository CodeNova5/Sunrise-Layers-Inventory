import { Permission } from "@/lib/permissions/server";
import permissionRequired from "@/lib/decorators/permission";
import { NextRequest, NextResponse } from "next/server";
import InsightsDAO from "@/lib/inventory/dao/insights";
import GoodModel from "@/lib/inventory/models/good";

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req
) {
  const before = req.nextUrl.searchParams.get("b");
  const after = req.nextUrl.searchParams.get("a");
  if (before && !Date.parse(before)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (after && !Date.parse(after)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const results = await InsightsDAO.getMostValuableAndProfitableProducts(
    before ? new Date(before) : undefined,
    after ? new Date(after) : undefined
  );
  const query: any = {};
  if (before && after) {
    query.createdAt = { $gte: new Date(after), $lte: new Date(before) };
  } else if (before) {
    query.createdAt = { $lte: new Date(before) };
  } else if (after) {
    query.createdAt = { $gte: new Date(after) };
  }
  const summary = await GoodModel.aggregate([
    {
      $facet: {
        inStock: [
          { $match: { $expr: { $gt: ["$qty", "$minQty"] } } },
          { $count: "count" },
        ],
        lowStock: [
          { $match: { $and: [{ $expr: { $lte: ["$qty", "$minQty"] } }, { $expr: { $gt: ["$qty", 0] } }] } },
          { $count: "count" },
        ],
        noStock: [
          { $match: { $expr: { $lte: ["$qty", 0] } } },
          { $count: "count" },
        ],
        total: [
          { $count: "count" },
        ],
      },
    },
    {
      $project: {
        inStock: { $ifNull: [{ $arrayElemAt: ["$inStock.count", 0] }, 0] },
        lowStock: { $ifNull: [{ $arrayElemAt: ["$lowStock.count", 0] }, 0] },
        noStock: { $ifNull: [{ $arrayElemAt: ["$noStock.count", 0] }, 0] },
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
      },
    },
  ])
  return NextResponse.json({ ...results, ...summary[0] });
});
