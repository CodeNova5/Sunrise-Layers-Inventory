import { Permission } from "@/lib/permissions/server";
import Good, { IGoodDocument } from "@/lib/inventory/models/good";
import permissionRequired from "@/lib/decorators/permission";
import { NextRequest, NextResponse } from "next/server";
import { FilterQuery } from "mongoose";
import GoodDAO from "@/lib/inventory/dao/good";
import qs from "qs";


type HasMinMax = Partial<{
  gte: string;
  lte: string;
}>;

export const GET = permissionRequired(Permission.AllowAny())(async function (
    req
) {
    const params = qs.parse(req.nextUrl.searchParams.toString());
    const limit = params.l ? parseInt(params.l as string) : 10;
    const page = params.p ? parseInt(params.p as string) : 1;
    const search = params.q?.toString().trim() as string | undefined;
    const status = params.s?.toString().trim() as
        | "in-stock"
        | "low-stock"
        | "out-of-stock"
        | null;
    const category = params.c?.toString().trim() as string | undefined;
    const qty = params.qty as HasMinMax | undefined;
    const query: FilterQuery<IGoodDocument> = {};
    if (status) {
        if (status === "in-stock") {
            query.$expr = { $gt: ["$qty", "$minQty"] };
        } else if (status === "low-stock") {
            query.$expr = { $lte: ["$qty", "$minQty"] };
            query.qty = { $gt: 0 };
        } else if (status === "out-of-stock") {
            query.qty = { $eq: 0 };
        }
    }
    if (qty) {
        query.qty = {};
        qty.lte && (query.qty.$lte = parseInt(qty.lte));
        qty.gte && (query.qty.$gte = parseInt(qty.gte));
    }
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { code: { $regex: search, $options: "i" } },
        ];
    }
    if (category) {
        query.categories = { $in: [category] };
    }
    
    const results = await GoodDAO.getGoods({ filters: query, page, limit });
    return NextResponse.json(results);
});
