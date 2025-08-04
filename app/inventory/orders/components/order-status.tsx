"use client";
import ClickableTooltip from "@/components/ui/clickable-tooltip";
import { Order, OrderSummary } from "@/lib/@types/order";
import { CircleHelp } from "lucide-react";

export default function OrderStatus({ status, overdueLimit, cancelReason }: (OrderSummary | Order)) {
  const overdueDate = new Date(overdueLimit);
  switch (status) {
    case "pending":
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          pending
        </span>
      );
    case "cancelled":
      return (
        <div className="flex items-center">
          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
            cancelled
          </span>
          <ClickableTooltip Trigger={CircleHelp} strokeWidth={1.5} size={16}>
            {cancelReason || "No reason provided"}
          </ClickableTooltip>
        </div>
      );
    case "overdue":
      return (
        <div className="flex items-center">
          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
            overdue
          </span>
          <ClickableTooltip Trigger={CircleHelp} strokeWidth={1.5} size={16}>
            This order has been overdue since{" "}
            {overdueDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </ClickableTooltip>
        </div>
      );
    case "paid":
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          paid
        </span>
      );
    case "ongoing":
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          ongoing
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
          {status}
        </span>
      );
  }
}