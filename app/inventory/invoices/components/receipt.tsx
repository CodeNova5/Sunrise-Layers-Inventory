"use client";

import Image from "next/image";
import { FC, useRef } from "react";
import { ExternalInvoice } from "@/lib/@types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatMoney, formatDate, cycle } from "@/lib/utils";
import {
  companyCountry,
  companyName,
  companyPhoneNumber,
  companyRegion,
  companyStreetAddress,
} from "@/data";

const InvoiceDocument: FC<ExternalInvoice> = (props) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const rowColor = cycle(["", "bg-pri-1"]);

  const calculateTotals = () => {
    const subtotal = props.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (props.discount / 100) * subtotal;
    const total = subtotal - discountAmount + props.tax + props.shipping;
    return { subtotal, discountAmount, total };
  };

  const downloadInvoice = () => {
    if (invoiceRef.current && props.id) {
      html2canvas(invoiceRef.current, { scale: 1 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("portrait", "pt", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${props.id.slice(0, 8)}.pdf`);
      });
    }
  };

  const { subtotal, discountAmount, total } = calculateTotals();

  return (
    <>
      <Button
        onClick={downloadInvoice}
        variant={"outline"}
        className="w-[40px] p-0 h-[40px] grow-0 shrink-0"
      >
        <Download size={28} strokeWidth={1.5} />
      </Button>
      <div
        className="w-[595px] mx-auto border border-[#ccc] min-h-[842px] font-nunito text-black"
        ref={invoiceRef}
      >
        <header className="flex flex-col items-center justify-start">
          <div className="bg-pri-5 w-full h-6" />
          <div className="flex justify-between items-start w-full px-6 mt-4">
            <div className="flex flex-col items-start justify-start gap-2">
              <Image
                src="/logo.png"
                width={50}
                height={50}
                alt="logo"
                className="rounded-full"
              />
              <h1 className="text-3xl font-rambla">External Invoice</h1>
            </div>
            <div className="flex flex-col items-end justify-start">
              <h2 className="font-rambla font-semibold">{companyName}</h2>
              <p className="text-xs">{companyStreetAddress}</p>
              <p className="text-xs">{companyRegion}</p>
              <p className="text-xs">{companyCountry}</p>
              <p className="text-xs">{companyPhoneNumber}</p>
            </div>
          </div>
          <hr className="border-gray-500 mt-4 h-[1px] w-[calc(100%_-_3rem)] mx-6" />
          <div className="flex items-center justify-between w-full px-6 mt-4">
            <div className="flex flex-col items-start justify-start">
              <h2 className="font-rambla font-semibold">Invoice Details</h2>
              <p className="text-xs font-semibold">DATE</p>
              <p className="text-xs">{formatDate(props.createdAt)}</p>
              <p className="text-xs font-semibold">DUE DATE</p>
              <p className="text-xs">{formatDate(props.dueDate)}</p>
            </div>
            <div className="flex flex-col items-end justify-start">
              <h2 className="font-rambla font-semibold">Bill To</h2>
              <p className="text-xs font-semibold">{props.client.fullName}</p>
              <p className="text-xs">{props.client.email}</p>
              <p className="text-xs">{props.client.phone}</p>
              <p className="text-xs">{props.client.address}</p>
            </div>
          </div>
        </header>

        <table className="mt-8 w-full px-6">
          <thead>
            <tr className="bg-pri-3">
              <th className="text-left font-rambla p-2">Item</th>
              <th className="text-left font-rambla p-2">Description</th>
              <th className="text-right font-rambla p-2">Quantity</th>
              <th className="text-right font-rambla p-2">Price</th>
              <th className="text-right font-rambla p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item, index) => (
              <tr key={index} className={rowColor()}>
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.description || '-'}</td>
                <td className="text-right p-2">{item.quantity}</td>
                <td className="text-right p-2">{formatMoney(item.price)}</td>
                <td className="text-right p-2">{formatMoney(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 px-6 flex justify-end">
          <div className="w-72">
            <div className="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Discount ({props.discount}%):</span>
              <span>{formatMoney(discountAmount)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Tax:</span>
              <span>{formatMoney(props.tax)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Shipping:</span>
              <span>{formatMoney(props.shipping)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold border-t">
              <span>Total:</span>
              <span>{formatMoney(total)}</span>
            </div>
            <div className="flex justify-between py-2 text-blue-600">
              <span>Amount Paid:</span>
              <span>{formatMoney(props.paymentMade)}</span>
            </div>
            <div className="flex justify-between py-2 text-red-600 font-bold">
              <span>Balance Due:</span>
              <span>{formatMoney(total - props.paymentMade)}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 px-6">
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Terms and Conditions</h3>
            <ul className="text-sm list-disc pl-4">
              <li className="mb-1">Payment is due within the terms stated on this invoice</li>
              <li className="mb-1">Please include invoice number on your payment</li>
              <li className="mb-1">Late payments may be subject to additional charges</li>
              <li className="mb-1">Bank transfer is our preferred payment method</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 px-6">
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Payment Details</h3>
            <p className="text-sm">
              Bank: Example Bank<br />
              Account Name: {companyName}<br />
              Account Number: XXXX-XXXX-XXXX<br />
              Sort Code: XX-XX-XX
            </p>
          </div>
        </div>

        <footer className="mt-12 px-6 pb-6 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-2 text-xs">
            Generated on {formatDate(new Date().toISOString())}
          </p>
        </footer>
      </div>
    </>
  );
};

export default InvoiceDocument;