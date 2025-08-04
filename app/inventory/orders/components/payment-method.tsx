"use client";
import { PaymentMethod as PaymentMethodT } from "@/lib/@types/order";

export default function PaymentMethod({
  paymentMethod,
}: {
  paymentMethod: PaymentMethodT;
}) {
  switch (paymentMethod) {
    case "cash":
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          cash
        </span>
      );
    case "credit":
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          credit
        </span>
      );
    case "debit":
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          debit
        </span>
      );
    case "voucher":
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          voucher
        </span>
      );
    case "bank":
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          bank
        </span>
      );
    case "cheque":
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          cheque
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          {paymentMethod}
        </span>
      );
  }
}
