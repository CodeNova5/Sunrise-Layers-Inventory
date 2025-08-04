"use client";
import {
  useQueryState,
  parseAsStringLiteral,
  parseAsTimestamp,
  parseAsInteger,
} from "nuqs";
import { PaymentMethod } from "@/lib/@types/order";
import { paymentMethodChoices } from "@/lib/@types/order";
import { PaymentFilter } from "../stores/payment-store";

type PaymentFilterProps = {
  method: PaymentMethod | null;
  orderId: string | null;
  customerId: string | null;
  amount: [min: number, max: number, step: number] | null;
  createdAt: [min: Date | null, max: Date | null] | null;
};

export function usePaymentFilter(props: PaymentFilterProps = {
    method: null,
    orderId: null,
    customerId: null,
    amount: null,
    createdAt: null,
}) {
  const [paymentMethod, setPaymentMethod] = useQueryState<PaymentMethod>(
    "payment:method",
    {
      ...parseAsStringLiteral(paymentMethodChoices),
      clearOnDefault: true,
      ...(props.method && { default: props.method }),
    }
  );
  const [orderId, setOrderId] = useQueryState("payment:order", {
    clearOnDefault: true,
    ...(props.orderId && { default: props.orderId }),
  });
  const [customerId, setCustomerId] = useQueryState("payment:customer", {
    clearOnDefault: true,
    ...(props.customerId && { default: props.customerId }),
  });
  const [minAmount, setMinAmount] = useQueryState("payment:amount[gte]", {
    ...parseAsInteger,
    clearOnDefault: true,
    ...(props.amount && { default: props.amount[0] }),
  });
  const [maxAmount, setMaxAmount] = useQueryState("payment:amount[lte]", {
    ...parseAsInteger,
    clearOnDefault: true,
    ...(props.amount && { default: props.amount[1] }),
  });
  const [minCreatedAt, setMinCreatedAt] = useQueryState(
    "payment:created[after]",
    {
      ...parseAsTimestamp,
      clearOnDefault: true,
      ...(props.createdAt &&
        props.createdAt[0] && { default: props.createdAt[0] }),
    }
  );
  const [maxCreatedAt, setMaxCreatedAt] = useQueryState(
    "payment:created[before]",
    {
      ...parseAsTimestamp,
      clearOnDefault: true,
      ...(props.createdAt &&
        props.createdAt[1] && { default: props.createdAt[1] }),
    }
  );

  function getFilter(): PaymentFilter {
    return {
      orderId: orderId
        ? props.orderId
          ? orderId === props.orderId
            ? undefined
            : orderId
          : orderId
        : undefined,
      customerId: customerId
        ? props.customerId
          ? customerId === props.customerId
            ? undefined
            : customerId
          : customerId
        : undefined,
      minAmount: minAmount
        ? props.amount
          ? minAmount === props.amount[0]
            ? undefined
            : minAmount
          : minAmount
        : undefined,
      maxAmount: maxAmount
        ? props.amount
          ? maxAmount === props.amount[1]
            ? undefined
            : maxAmount
          : maxAmount
        : undefined,
      minCreatedAt: minCreatedAt
        ? props.createdAt
          ? minCreatedAt === props.createdAt[0]
            ? undefined
            : minCreatedAt
          : minCreatedAt
        : undefined,
      maxCreatedAt: maxCreatedAt
        ? props.createdAt
          ? maxCreatedAt === props.createdAt[1]
            ? undefined
            : maxCreatedAt
          : maxCreatedAt
        : undefined,
    };
  }

  return {
    paymentMethod,
    setPaymentMethod,
    orderId,
    setOrderId,
    customerId,
    setCustomerId,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    minCreatedAt,
    setMinCreatedAt,
    maxCreatedAt,
    setMaxCreatedAt,
    getFilter,
  };
}
