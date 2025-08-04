import { Permission } from "@/lib/permissions/server";
import Good, { IGoodDocument } from "@/lib/inventory/models/good";
import permissionRequired from "@/lib/decorators/permission";
import { NextRequest, NextResponse } from "next/server";

export const GET = permissionRequired(Permission.AllowAny())(async function (req) {
    const categories = await Good.distinct("categories");
    return NextResponse.json(categories);
});
