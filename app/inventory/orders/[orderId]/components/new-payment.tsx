"use client";
import { Button } from "@/components/ui/button";
import NumberInput from "@/components/ui/number-input";
import { Order, PaymentMethod, paymentMethodChoices } from "@/lib/@types/order";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { createPayment } from "@/lib/stores/payment-store";
import { toast } from "react-toastify";

export default function NewPayment({ order }: { order: Order }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amount, setAmount] = useState(0);
  const total = order.items.reduce(
    (acc, item) => acc + item.sellingPrice * item.qty,
    0
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const balance = total - order.amountPaid;

  function handleSave() {
    if (balance <= 0) {
      toast.error("Order has been fully paid for");
      return;
    }
    if (amount > balance) {
      toast.error(`Amount cannot be more than ${balance}`);
      return;
    }
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    setStatus("saving");
    createPayment({
      amount,
      order: order.id,
      paymentMethod,
      customer: order.buyer.id,
    })
      .then(() => {
        toast.success("Payment saved successfully");
        setStatus("idle");
        setAmount(0);
      })
      .catch(() => {
        setStatus("error");
      });
  }

  return (
    <div className="flex flex-col flex-1 p-4 pr-8 pt-8 gap-4 h-[15rem]">
      <div className="flex gap-4 items-center justify-between">
        <p className="text-lg">Amount</p>
        <NumberInput
          prependSymbol
          symbol="₦"
          className="w-40"
          max={balance}
          min={0}
          value={amount}
          onChange={(value) => setAmount(value)}
        />
      </div>
      <div className="flex gap-4 items-center">
        <p className="text-lg">Payment Method</p>
        <Select
          value={{ value: paymentMethod, label: paymentMethod }}
          onChange={(value) => setPaymentMethod(value!.value)}
          options={paymentMethodChoices.map((choice) => ({
            value: choice,
            label: choice,
          }))}
          isSearchable={false}
          maxMenuHeight={100}
          classNames={{ menuList: () => "scrollbar-thin text-sm" }}
        />
      </div>
      <div className="flex gap-4 items-end w-full justify-between flex-1 self-end">
        <Button
          variant="default"
          className="w-full"
          onClick={handleSave}
          disabled={status == "saving"}
        >
          {status == "saving" ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
