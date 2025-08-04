import permissionRequired from "@/lib/decorators/permission";
import OrderPaymentDAO from "@/lib/inventory/dao/orderPayment";
import { Permission } from "@/lib/permissions/server";
import { NextResponse, NextRequest } from "next/server";

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  const payment = await OrderPaymentDAO.getOrderPayment(params.paymentId);
  return NextResponse.json(payment);
});
