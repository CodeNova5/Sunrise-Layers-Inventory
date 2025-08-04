"use client";
import Image from "next/image";
import { FC, useState, useEffect, useRef } from "react";
import { Order } from "@/lib/@types/order";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  formatInvoiceNumber,
  formatMoney,
  formatDate,
  cycle,
} from "@/lib/utils";
import {
  companyCountry,
  companyName,
  companyPhoneNumber,
  companyRegion,
  companyStreetAddress,
} from "@/data";

const Invoice: FC<Order> = (props) => {
  const [subTotal, setSub] = useState(0);
  const [discount, setDiscount] = useState(0);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const rowColor = cycle(["", "bg-pri-1"]);

  const printInvoice = () => {
    if (invoiceRef.current && props.orderNo) {
      html2canvas(invoiceRef.current, { scale: 1 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("portrait", "pt", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        let pdfWidth = pdf.internal.pageSize.getWidth();
        let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = imgProps.height;

        const pageHeight = pdf.internal.pageSize.getHeight();
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgProps.height;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(
          `Invoice ${formatInvoiceNumber(props.orderNo)} For ${
            props.buyer.name
          }.pdf`
        );
      });
    }
  };
  useEffect(() => {
    if (props) {
      const sTotal = props.items.reduce(
        (total, item) => total + item.sellingPrice * item.qty,
        0
      );
      setSub(sTotal);
      const dc = (props.discount / 100) * sTotal;
      setDiscount(dc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);
  return (
    <>
      <Button
        onClick={printInvoice}
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
              <h1 className="text-3xl font-rambla">Invoice</h1>
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
              <h2 className="font-rambla font-semibold">
                Invoice {formatInvoiceNumber(props.orderNo)}
              </h2>
              <p className="text-xs font-semibold">DATE</p>
              <p className="text-xs">{formatDate(props.createdAt)}</p>
              <p className="text-xs font-semibold">INVOICE DUE DATE</p>
              <p className="text-xs">{formatDate(props.overdueLimit)}</p>
            </div>
            <div className="flex flex-col items-end justify-start">
              <h2 className="font-rambla font-semibold">Bill To</h2>
              <p className="text-xs font-semibold">{props.buyer.name}</p>
              <p className="text-xs">{props.buyer.email}</p>
              <p className="text-xs">{props.buyer.phone}</p>
            </div>
          </div>
          <hr className="border-gray-500 mt-4 h-[1px] w-[calc(100%_-_3rem)] mx-6" />
        </header>
        <table className="mt-5 mx-auto px-6 w-[calc(100%_-_3rem)]">
          <thead>
            <tr className="bg-pri-3">
              <th className="text-left font-rambla font-semibold text-sm  px-1 p-2">
                S/N
              </th>
              <th className="text-left font-rambla font-semibold text-sm  px-1 p-2">
                Description
              </th>
              <th className="text-left font-rambla font-semibold text-sm  px-1 p-2">
                Qty
              </th>
              <th className="text-left font-rambla font-semibold text-sm  px-1 p-2">
                Price
              </th>
              <th className="text-right font-rambla font-semibold text-sm  px-1 pr-3 p-2">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item, id) => {
              return (
                <tr key={id} className={rowColor()}>
                  <td className="font-nunito  p-1 text-xs pb-4">{id + 1}</td>
                  <td className="font-nunito  p-1 text-xs pb-4">
                    {item.good.name}
                  </td>
                  <td className="font-nunito  p-1 text-xs pb-4">{item.qty}</td>
                  <td className="font-nunito  p-1 text-xs pb-4">
                    {formatMoney(item.sellingPrice)}
                  </td>
                  <td className="font-nunito  p-1 text-xs text-right pr-3 pb-4">
                    {formatMoney(item.sellingPrice * item.qty)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <hr className="border-gray-500 mt-12 h-[1px] w-[calc(100%_-_3rem)] mx-6" />

        <div className="mt-5 flex flex-row items-center justify-between gap-5 px-6">
          <div className="flex flex-col items-start justify-start">
            <h2 className="italic text-sm font-rambla text-pri-6 text-center text-wrap pl-6">
              Thank you for doing business with us. Have a great day
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-row items-center justify-between gap-4 w-full">
              <p className="font-rambla text-xs font-semibold">Subtotal</p>
              <p className="font-rambla text-xs">{formatMoney(subTotal)}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-4 w-full">
              <p className="font-rambla text-xs font-semibold">Discount</p>
              <p className="font-rambla text-xs">{formatMoney(discount)}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-4 w-full mt-2">
              <p className="font-rambla text-sm font-semibold">Total</p>
              <p className="font-rambla text-sm">
                {formatMoney(subTotal - discount)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 px-6 w-full">
          <p className="border-b border-gray-700 text-xs font-semibold w-[40%] mb-2">
            Terms and Conditions
          </p>
          <ul>
            <li className="list-disc text-[8px]">
              Ensure you obtain a receipt for each cash transaction you make at
              our office
            </li>
            <li className="list-disc text-[8px]">
              Ensure the receipt is also signed by the concerned staff
            </li>
            <li className="list-disc text-[8px]">
              All cheques must have a validity window of at most two weeks and
              at least two weeks
            </li>
            <li className="list-disc text-[8px]">
              Expired, forged or dishonored cheques will not be accepted
            </li>
            <li className="list-disc text-[8px]">
              Ensure all transactions are successful and follow up by contacting
              the concerned staff for immediate processing
            </li>
            <li className="list-disc text-[8px]">
              We will not take liability for any failed transactions/transfers
            </li>
          </ul>
        </div>
        <footer className="mt-3 px-2 pb-1">
          <p className="font-nunito text-[10px] font-italic">
            Generated on {formatDate(new Date(Date.now()).toISOString())}
          </p>
        </footer>
      </div>
    </>
  );
};
export default Invoice;
