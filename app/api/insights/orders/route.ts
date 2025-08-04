import { Permission } from "@/lib/permissions/server";
import permissionRequired from "@/lib/decorators/permission";
import { NextRequest, NextResponse } from "next/server";
import InsightsDAO  from "@/lib/inventory/dao/insights"

export const GET = permissionRequired(Permission.AllowAny())(async function (
    req
) {
    const before = req.nextUrl.searchParams.get("b");
    const metric = req.nextUrl.searchParams.get("m") as
      | "hour"
      | "day"
      | "month"
      | "year"
      | null;
    const after = req.nextUrl.searchParams.get("a");
    if (!metric) {
        return NextResponse.json({error: 'Metric is required'}, {status: 400});
    }
    if (!['hour', 'day', 'month', 'year'].includes(metric)) {
        return NextResponse.json({error: 'Invalid metric'}, {status: 400});
    }
    if (before && !Date.parse(before)) {
        return NextResponse.json({error: 'Invalid date'}, {status: 400});
    }
    if (after && !Date.parse(after)) {
        return NextResponse.json({error: 'Invalid date'}, {status: 400});
    }
    const results = await InsightsDAO.revenueByPeriod(
        metric,
        before ? new Date(before) : undefined,
        after ? new Date(after) : undefined
    );
    return NextResponse.json(results);
});
