import { Permission } from "@/lib/permissions/server";
import permissionRequired from "@/lib/decorators/permission";
import { NextResponse } from "next/server";
import LogDAO, { logParams } from "@/lib/common/dao/log";
import mongoose, { Types } from "mongoose";
import { EntityNotFound } from "@/lib/errors";
import ExternalInvoiceDAO from "@/lib/inventory/dao/externalInvoice";
import { ExternalInvoiceModification } from "@/lib/@types/invoice";


interface UpdateInvoice {
    discount?: number;
    dueDate?: string;
    // items: ExternalInvoiceItem[];
    tax?: number;
    shipping?: number;
    paymentMade?: number;
}

export const GET = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { invoiceId: string } }
) {
  const invoice = await ExternalInvoiceDAO.getExternalInvoiceById(
    mongoose.Types.ObjectId.createFromHexString(params.invoiceId)
  );
  return NextResponse.json(invoice);
});

export const PUT = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { invoiceId: string } }
) {
  const body = (await req.json()) as UpdateInvoice;

  const prevInvoice = await ExternalInvoiceDAO.getExternalInvoiceById(
    mongoose.Types.ObjectId.createFromHexString(params.invoiceId)
  );
  if (!prevInvoice) {
    return EntityNotFound.construct("Invoice", params.invoiceId)
  }
  const details: { [key: string]: any } = {};
  for (const key of Object.keys(body) as (keyof UpdateInvoice)[]) {
    details[key] = prevInvoice[key];
  } 
  const invoice = await ExternalInvoiceDAO.updateExternalInvoice(
    mongoose.Types.ObjectId.createFromHexString(params.invoiceId),
    body as ExternalInvoiceModification
  );
  if (!invoice) {
      return EntityNotFound.construct("INvoice", params.invoiceId);
  }
  const logDetails: logParams = {
    display: [this.user.fullName(), invoice.id],
    targetId: Types.ObjectId.createFromHexString(invoice.id),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Invoice",
    details,
  };
  await LogDAO.logModification(logDetails);
  return NextResponse.json(invoice);
});

export const DELETE = permissionRequired(Permission.AllowAny())(async function (
  req,
  { params }: { params: { invoiceId: string } }
) {
  const invoice = await ExternalInvoiceDAO.deleteExternalInvoice(
    mongoose.Types.ObjectId.createFromHexString(params.invoiceId)
  );

  if (!invoice) {
    return EntityNotFound.construct("Invoice", params.invoiceId);
  }
  const logDetails: logParams = {
    display: [this.user.fullName(), params.invoiceId],
    targetId: Types.ObjectId.createFromHexString(params.invoiceId),
    loggerId: Types.ObjectId.createFromHexString(this.user.id),
    target: "Invoice",
  };
  await LogDAO.logDeletion(logDetails);
  return new NextResponse(null, { status: 204 });
});
