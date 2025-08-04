"use client";

import React, { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp, MoveLeft } from "lucide-react";
import Link from "next/link";
import NumberInput from "@/components/ui/number-input";
import { formatCurrencyShort } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useExternalInvoiceStore } from "@/lib/providers/invoice-store-provider";
import { toast } from "react-toastify";
import * as z from "zod";
import { Label } from "@/components/ui/label";

const invoiceItemSchema = z.object({
  name: z.string(
    {
      description: "Item name",
    }
  ).min(1, "Item name is required"),
  description: z.string(
    {
      description: "Item description",
    }
  ).optional(),
  quantity: z.number(
    {
      description: "Item quantity",
    }
  ).min(1, "Quantity must be at least 1"),
  price: z.number(
    {
      description: "Item price per unit",
    }
  ).min(0, "Price must be 0 or greater")
});

const invoiceSchema = z.object({
  client: z.object({
    fullName: z.string(
      {
        description: "Customer full name",
      }
    ).min(1, "Full name is required"),
    email: z.string(
      {
        description: "Customer email address",
      }
    ).email("Invalid email address"),
    address: z.string(
      {
        description: "Customer address",
      }
    ).min(1, "Address is required"),
    phone: z.string(
      {
        description: "Customer phone number",
      }
    ).min(1, "Phone number is required")
  }),
  dueDate: z.string({
    description: "Due date",
  }).min(1, "Due date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  discount: z.number(
    {
      description: "Discount percentage",
    }
  ).min(0, "Discount must be 0 or greater").max(100, "Discount cannot exceed 100%"),
  tax: z.number(
    {
      description: "Tax percentage",
    }
  ).min(0, "Tax must be 0 or greater").max(100, "Tax cannot exceed 100%"),
  shipping: z.number(
    {
      description: "Shipping cost",
    }
  ).min(0, "Shipping must be 0 or greater")
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;
type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;

const NewInvoice = () => {
  const router = useRouter();
  const { createInvoice } = useExternalInvoiceStore(state => state);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client: {
        fullName: "",
        email: "",
        address: "",
        phone: "",
      },
      dueDate: new Date().toISOString().split("T")[0],
      items: [{ name: "", quantity: 0, price: 0 }],
      discount: 0,
      tax: 0,
      shipping: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const values = form.watch();

  const subtotal = values.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  const discountAmount = (subtotal * (values.discount || 0)) / 100;
  const taxAmount = (subtotal * (values.tax || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount + (values.shipping || 0);

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const invoice = await createInvoice({
        ...data,
        paymentMade: total,
      });
      console.log("Invoice created:", invoice);
      toast.success("Invoice created successfully");
      router.push(`/inventory/invoices/${invoice.id}`);
    } catch (error) {
      toast.error("Failed to create invoice");
      console.error("Error creating invoice:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col absolute top-[60px] gap-4 h-full w-full justify-start items-start p-6">
        <div className="flex w-full justify-start items-start pt-1">
          <Link
            href="/inventory/invoices"
            className="text-black hover:text-pri-5 bg-white p-2 border-2 rounded-sm border-neu-4 transition"
          >
            <MoveLeft size={20} />
          </Link>
          <div className="flex flex-col items-start justify-center ml-2">
            <h1 className="text-xl font-bold text-gray-800">Create Invoice</h1>
            <h6 className="text-gray-400 text-xs">
              {new Date().toLocaleDateString()}
            </h6>
          </div>
        </div>

        {/* Client Information */}
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-semibold">Client Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="client.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client.email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client.address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client.phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between w-full gap-2">
            <h3 className="text-lg font-semibold">Invoice Items</h3>
            <Button
              type="button"
              onClick={() => append({ name: "", quantity: 0, price: 0 })}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>
        </div>

        <div className="space-y-4 w-full">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-gray-50 pr-4 rounded-lg">
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      {
                        index === 0 ? (
                          <Label className="font-quicksand">Item Name</Label>
                        ) : null
                      }
                      <FormControl>
                        <Input placeholder="Item Name" {...field} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-4">
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      {
                        index === 0 ? (
                          <Label className="font-quicksand">Item Description</Label>
                        ) : null
                      }
                      <FormControl>
                        <Input placeholder="Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      {
                        index === 0 ? (
                          <Label className="font-quicksand">Qty Sold</Label>
                        ) : null
                      }
                      <FormControl>
                        <NumberInput
                          placeholder="Quantity"
                          value={field.value}
                          onChange={(value) => form.setValue(`items.${index}.quantity`, value)}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      {
                        index === 0 ? (
                          <Label className="font-quicksand">Price Per Unit</Label>
                        ) : null
                      }
                      <FormControl>
                        <NumberInput
                          prependSymbol
                          symbol="₦"
                          placeholder="Price Per Unit"
                          value={field.value}
                          onChange={(value) => form.setValue(`items.${index}.price`, value)}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Charges */}
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-semibold">Additional Charges</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <Label className="font-quicksand">Discount (%)</Label>
                  <FormControl>
                    <NumberInput
                      placeholder="Discount %"
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                      max={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tax"
              render={({ field }) => (
                <FormItem>
                  <Label className="font-quicksand">Tax (%)</Label>
                  <FormControl>
                    <NumberInput
                      placeholder="Tax %"
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                      max={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shipping"
              render={({ field }) => (
                <FormItem>
                  <Label className="font-quicksand">Shipping (%)</Label>
                  <FormControl>
                    <NumberInput
                      prependSymbol
                      symbol="₦"
                      placeholder="Shipping"
                      value={field.value}
                      onChange={field.onChange}
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Total and Submit */}
        <div className="space-y-4 pt-4 border-t mt-4 w-96">
          <div className="flex justify-between items-center">
            <span>Subtotal:</span>
            <span>{formatCurrencyShort(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Discount:</span>
            <span>{formatCurrencyShort(discountAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Tax:</span>
            <span>{formatCurrencyShort(taxAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>{formatCurrencyShort(total)}</span>
          </div>
          <Button type="submit" className="w-full mt-4">
            Create Invoice
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewInvoice;