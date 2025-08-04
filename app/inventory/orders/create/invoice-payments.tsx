import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { PaymentMethod, paymentMethodChoices } from "@/lib/@types/order";
import { PlusCircle, Trash } from "lucide-react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import NumberInput from "@/components/ui/number-input";
import { CreateInvoiceState } from "./types";
import { useEffect } from "react";
import { cn, formatMoney } from "@/lib/utils";
import React from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Payment: React.FC<
  CreateInvoiceState["payments"][0] & {
    handleChange: (amount: number, method: PaymentMethod) => void;
    handleDelete: () => void;
    bodyRef: React.MutableRefObject<HTMLElement | null>;
    first?: boolean;
  }
> = ({ amount, paymentMethod, handleChange, handleDelete, first, bodyRef }) => {
  return (
    <div className="flex w-full bg-[#FFF3E0] p-2 rounded">
      <div className="flex flex-col h-fit mr-2">
        {first && <label className="text-sm text-[#6D4C41] mb-2">Amount</label>}
        <div className="w-[120px]">
          <NumberInput
            prependSymbol
            min={0}
            symbol="₦"
            value={amount}
            onChange={(value) => {
              handleChange(value, paymentMethod);
            }}
          />
        </div>
      </div>
      <div className="flex flex-col w-[150px] h-fit">
        {first && (
          <label className="text-sm text-[#6D4C41] mb-2">Payment Method</label>
        )}
        <Select
          value={{ value: paymentMethod, label: paymentMethod }}
          options={paymentMethodChoices.map((choice) => ({
            value: choice,
            label: choice,
          }))}
          isSearchable={false}
          maxMenuHeight={150}
          menuPortalTarget={bodyRef.current}
          classNames={{ menuList: () => "scrollbar-thin text-sm" }}
          onChange={(value) => handleChange(amount, value!.value)}
        />
      </div>
      <Button
        variant="ghost"
        onClick={handleDelete}
        className={"ml-2 text-[#6D4C41]" + (first ? " mt-6" : "")}
      >
        <Trash size={15} strokeWidth={1} />
      </Button>
    </div>
  );
};

const PaymentDates: React.FC<
  Pick<CreateInvoiceState, "issueDate" | "dueDate" | "setIssueDate" | "setDueDate">
> = ({ issueDate, dueDate, setIssueDate, setDueDate }) => {
  return (
    <div className="flex md:flex-col flex-wrap gap-4 p-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="customer" className="text-sm text-[#6D4C41]">
          Issue Date
        </label>
        <DatePicker date={issueDate} setDate={setIssueDate} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="customer" className="text-sm text-[#6D4C41]">
          Due Date
        </label>
        <DatePicker date={dueDate} setDate={setDueDate} />
      </div>
    </div>
  );
};

const Payments: React.FC<Pick<CreateInvoiceState, "payments" | "setPayments">> = ({
  payments,
  setPayments,
}) => {
  const bodyRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    bodyRef.current = document.body;
  }, []);

  useEffect(() => {
    if (!payments.length) {
      setPayments([{ amount: 0, paymentMethod: "cash" }]);
    }
  }, [payments]);

  function handleDeletePayment(index: number) {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
  }

  function handleChangePayment(index: number, amount: number, method: PaymentMethod) {
    const newPayments = [...payments];
    newPayments[index] = { amount: amount, paymentMethod: method };
    setPayments(newPayments);
  }

  return (
    <div className="flex flex-col overflow-x-auto w-full scrollbar-thin gap-4 p-2 max-h-[15rem] min-h-[6rem]">
      {payments.map((payment, index) => (
        <Payment
          key={index}
          first={index === 0}
          bodyRef={bodyRef}
          {...payment}
          handleChange={(amount, method) => handleChangePayment(index, amount, method)}
          handleDelete={() => handleDeletePayment(index)}
        />
      ))}
    </div>
  );
};

const PaymentSummary: React.FC<
  Pick<CreateInvoiceState, "discount" | "setDiscount"> & {
    subTotal: number;
    discountAmount: number;
    total: number;
    amountPaid: number;
    outstanding: number;
  }
> = ({
  discount,
  setDiscount,
  subTotal,
  discountAmount,
  total,
  amountPaid,
  outstanding,
}) => {
  return (
    <div className="flex flex-col gap-2 p-2 w-full bg-[#FFF3E0] rounded">
      <div className="flex justify-between gap-2">
        <label className="text-sm text-[#6D4C41]">Discount</label>
        <NumberInput
          prependSymbol
          symbol="%"
          className="w-[3.7rem]"
          min={0}
          max={100}
          value={discount}
          onChange={(value) => setDiscount(value)}
        />
      </div>
      <div className="flex justify-between gap-2">
        <label className="text-sm text-[#6D4C41]">Discount Amount</label>
        <p className="text-sm text-[#6D4C41]">{formatMoney(discountAmount)}</p>
      </div>
      <div className="flex justify-between gap-2">
        <label className="text-sm text-[#6D4C41]">Subtotal</label>
        <p className="text-sm text-[#6D4C41]">{formatMoney(subTotal)}</p>
      </div>
      <div className="flex justify-between gap-2">
        <label className="text-sm text-[#6D4C41]">Total</label>
        <p className="text-sm text-[#6D4C41]">{formatMoney(total)}</p>
      </div>
      <div className={cn("flex justify-between gap-2", amountPaid == total && "hidden")}>
        <label className="text-sm text-[#6D4C41]">
          {amountPaid >= total ? "Change" : "Outstanding"}
        </label>
        <p className="text-sm text-[#6D4C41]">
          {formatMoney(outstanding < 0 ? outstanding * -1 : outstanding)}
        </p>
      </div>
    </div>
  );
};

const SaveButton: React.FC<{
  status: "idle" | "loading" | "error";
  handleSave: () => void;
}> = ({ status, handleSave }) => {
  return (
    <Button
      variant={"default"}
      onClick={handleSave}
      className={cn(
        "w-full bg-[#FFD54F] text-[#5D4037]",
        status === "error" && "bg-[#FF7043] disabled:opacity-100 text-white"
      )}
      disabled={status !== "idle"}
    >
      {(() => {
        switch (status) {
          case "idle":
            return "Save";
          case "loading":
            return "Saving...";
          case "error":
            return "Could Not Save";
        }
      })()}
    </Button>
  );
};

export default function InvoicePayments({
  discount,
  payments,
  issueDate,
  dueDate,
  items,
  notes,
  customer,
  setPayments,
  setIssueDate,
  setDueDate,
  setDiscount,
  handleSave: saveInvoice,
}: CreateInvoiceState) {
  const subTotal = items.reduce((acc, item) => acc + item.cost * item.quantity, 0);
  const discountAmount = subTotal * (discount / 100);
  const total = subTotal - discountAmount;
  const amountPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);
  const outstanding = total - amountPaid;
  const canAddPayment = amountPaid < total;
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const router = useRouter();

  useEffect(() => {
    if (saveStatus === "error") setSaveStatus("idle");
  }, [notes, dueDate, issueDate, discount, customer, items, payments]);

  function handleAddPayment() {
    setPayments([
      ...payments.filter((p) => p.amount != 0),
      { amount: 0, paymentMethod: "cash" },
    ]);
  }

  function handleAddOutstanding() {
    setPayments([
      ...payments.filter((p) => p.amount != 0),
      { amount: outstanding, paymentMethod: "cash" },
    ]);
  }

  async function handleSave() {
    setSaveStatus("loading");
    try {
      const order = await saveInvoice();
      setSaveStatus("idle");
      toast.success("Invoice saved successfully.", { toastId: "invoice-save" });
      setTimeout(() => {
        toast.info("Redirecting to invoice page...", {
          toastId: "invoice-save",
        });
      }, 1000);
      setTimeout(() => {
        router.push(`/inventory/orders/${order.id}`);
      }, 3000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred. Please try again.",
        { toastId: "invoice-save" }
      );
      setSaveStatus("error");
    }
  }

  return (
    <div className="flex flex-col justify-start items-start gap-4 w-full p-2 flex-grow border border-[#FFE082] rounded-lg shadow bg-[#FFF8E1]">
      <h1 className="text-xl font-bold text-[#5D4037] p-2">Payment</h1>
      <PaymentDates
        issueDate={issueDate}
        dueDate={dueDate}
        setIssueDate={setIssueDate}
        setDueDate={setDueDate}
      />
      <Payments payments={payments} setPayments={setPayments} />
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={handleAddPayment}
          disabled={!canAddPayment}
          hidden={outstanding <= 0}
          className="text-[#6D4C41] hover:bg-[#FFE082]"
        >
          <PlusCircle size={24} strokeWidth={1.5} className="mr-2" />
          Add Payment
        </Button>
        <Button
          variant="ghost"
          onClick={handleAddOutstanding}
          disabled={!canAddPayment}
          hidden={outstanding <= 0}
          className="text-[#6D4C41] hover:bg-[#FFE082]"
        >
          <PlusCircle size={24} strokeWidth={1.5} className="mr-2" />
          Add Outstanding
        </Button>
      </div>

      <PaymentSummary
        {...{
          discount,
          setDiscount,
          subTotal,
          discountAmount,
          total,
          amountPaid,
          outstanding,
        }}
      />
      <div className="flex flex-grow items-end justify-around pl-2 pt-0 h-[70px] w-full gap-2 mt-auto">
        <SaveButton status={saveStatus} handleSave={handleSave} />
      </div>
    </div>
  );
}
