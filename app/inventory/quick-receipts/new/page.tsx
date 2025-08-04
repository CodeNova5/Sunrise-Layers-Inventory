"use client";

import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MoveLeft } from "lucide-react";
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

const receiptItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be 0 or greater")
});

const receiptSchema = z.object({
  client: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
    phone: z.string().min(1, "Phone number is required")
  }),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(receiptItemSchema).min(1, "At least one item is required"),
  discount: z.number().min(0, "Discount must be 0 or greater").max(100, "Discount cannot exceed 100%"),
  tax: z.number().min(0, "Tax must be 0 or greater").max(100, "Tax cannot exceed 100%"),
  shipping: z.number().min(0, "Shipping must be 0 or greater")
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

export default function NewReceipt() {
  const router = useRouter();
  const { createInvoice } = useExternalInvoiceStore(state => state);

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
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

  const onSubmit = async (data: ReceiptFormValues) => {
    try {
      const receipt = await createInvoice({
        ...data,
        paymentMade: total, // Payment is recorded immediately
      });
      console.log("Receipt created:", receipt);
      toast.success("Receipt created successfully");
      router.push(`/inventory/quick-receipts/${receipt.id}`);
    } catch (error) {
      toast.error("Failed to create receipt");
      console.error("Error creating receipt:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col absolute top-[60px] gap-4 h-full w-full justify-start items-start p-6">
        <div className="flex w-full justify-start items-start pt-1">
          <Link
            href="/inventory/quick-receipts"
            className="text-black hover:text-pri-5 bg-white p-2 border-2 rounded-sm border-neu-4 transition"
          >
            <MoveLeft size={20} />
          </Link>
          <div className="flex flex-col items-start justify-center ml-2">
            <h1 className="text-xl font-bold text-gray-800">Create Receipt</h1>
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

        {/* Receipt Items */}
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between w-full gap-2">
            <h3 className="text-lg font-semibold">Receipt Items</h3>
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
                      {index === 0 ? (
                        <Label className="font-quicksand">Item Name</Label>
                      ) : null}
                      <FormControl>
                        <Input placeholder="Item Name" {...field} />
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
                      {index === 0 ? (
                        <Label className="font-quicksand">Item Description</Label>
                      ) : null}
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
                      {index === 0 ? (
                        <Label className="font-quicksand">Qty Sold</Label>
                      ) : null}
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
                      {index === 0 ? (
                        <Label className="font-quicksand">Price Per Unit</Label>
                      ) : null}
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
              <div className="flex items-center md:col-span-1 h-full">
                <Button
                  type="button"
                  variant="ghost"
                  className="p-0 h-9 w-9 text-gray-500"
                  onClick={() => {
                    if (fields.length > 1) {
                      remove(index);
                    } else {
                      toast.error("At least one item is required");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="Discount"
                    value={field.value}
                    onChange={(value) => form.setValue("discount", value)}
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
                <FormLabel>Tax (%)</FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="Tax"
                    value={field.value}
                    onChange={(value) => form.setValue("tax", value)}
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
                <FormLabel>Shipping Cost (₦)</FormLabel>
                <FormControl>
                  <NumberInput
                    prependSymbol
                    symbol="₦"
                    placeholder="Shipping"
                    value={field.value}
                    onChange={(value) => form.setValue("shipping", value)}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Summary */}
        <div className="w-full md:w-1/2 ml-auto rounded-lg mt-4 p-4 border border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrencyShort(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount ({values.discount}%):</span>
              <span>-{formatCurrencyShort(discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({values.tax}%):</span>
              <span>+{formatCurrencyShort(taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>+{formatCurrencyShort(values.shipping || 0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold">Total:</span>
              <span className="font-bold">{formatCurrencyShort(total)}</span>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end mt-4 mb-20">
          <Button type="submit" className="min-w-[150px]">
            Create Receipt and Record Payment
          </Button>
        </div>
      </form>
    </Form>
  );
} 