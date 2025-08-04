"use client";
import Image from "next/image";
import { FC, useState, useEffect, useRef } from "react";
import { Order } from "@/lib/@types/order";
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
  companyVatId  // Make sure to add this to your data file
} from "@/data";

const OrderReceipt: FC<Order> = (props) => {
  const [subTotal, setSubTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const receiptRef = useRef<HTMLDivElement>(null);
  const rowColor = cycle(["", "bg-gray-50"]);

  // Calculate totals when props change
  useEffect(() => {
    if (props) {
      const sTotal = props.items.reduce(
        (total, item) => total + item.sellingPrice * item.qty,
        0
      );
      setSubTotal(sTotal);
      const dc = (props.discount / 100) * sTotal;
      setDiscount(dc);
      setTotal(sTotal - dc);
    }
  }, [props]);

  // Generate PDF directly using jsPDF without html2canvas
  const generatePDF = () => {
    if (!props.orderNo) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);

    // Set accent color
    const accentColor = "#444444";

    // Function to add header to a page
    const addHeader = () => {
      // Add header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor);
      doc.text(companyName, margin, margin + 7);

      // Add company info on right
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(companyName, pageWidth - margin, margin, { align: "right" });
      doc.text(companyStreetAddress, pageWidth - margin, margin + 15, { align: "right" });
      doc.text(companyRegion + ", " + companyCountry, pageWidth - margin, margin + 30, { align: "right" });
      doc.text("VAT ID: " + (companyVatId || "N/A"), pageWidth - margin, margin + 45, { align: "right" });
    };

    // Function to add footer to a page
    const addFooter = () => {
      const footerY = pageHeight - 50;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Thank you for doing business with us. Have a great day.",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );

      // Add generation date
      doc.setFontSize(8);
      doc.text(
        "Generated on " + formatDate(new Date().toISOString()),
        pageWidth / 2,
        footerY + 15,
        { align: "center" }
      );
    };

    // Add first page header
    addHeader();

    // Add invoice title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", margin, 160);

    // Add horizontal line
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(1);
    doc.line(margin, 183, pageWidth - margin, 183);

    // Add invoice details
    const customerInfoTop = 197;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Invoice No:", margin, customerInfoTop);
    doc.setFont("helvetica", "bold");
    doc.text(formatInvoiceNumber(props.orderNo), margin + 100, customerInfoTop);

    doc.setFont("helvetica", "normal");
    doc.text("Invoice Date:", margin, customerInfoTop + 15);
    doc.text(formatDate(props.createdAt), margin + 100, customerInfoTop + 15);

    doc.text("Balance Due:", margin, customerInfoTop + 30);
    doc.text(formatMoney(total), margin + 100, customerInfoTop + 30);

    // Add customer information
    doc.setFont("helvetica", "bold");
    doc.text(props.buyer.name, 300, customerInfoTop);
    doc.setFont("helvetica", "normal");
    doc.text(props.buyer.email, 300, customerInfoTop + 15);
    doc.text(props.buyer.phone, 300, customerInfoTop + 30);

    // Add horizontal line
    doc.line(margin, 250, pageWidth - margin, 250);

    // Add invoice table header
    let invoiceTableTop = 280;
    const addTableHeader = (y: number) => {
      doc.setFont("helvetica", "bold");
      doc.text("Item", margin, y);
      doc.text("Qty", 280, y);
      doc.text("Unit Price", 330, y);
      doc.text("Total", pageWidth - margin, y, { align: "right" });

      // Add horizontal line
      doc.line(margin, y + 10, pageWidth - margin, y + 10);

      return y + 30; // Return the new y position
    };

    let y = addTableHeader(invoiceTableTop);
    doc.setFont("helvetica", "normal");

    // Calculate space needed for each item (approximate)
    const itemHeight = 40; // Height per item row

    // Add invoice items with pagination
    for (let i = 0; i < props.items.length; i++) {
      const item = props.items[i];

      // Check if we need a new page
      if (y > pageHeight - 150) { // Leave room for totals and footer
        addFooter();
        doc.addPage();
        addHeader();
        y = 120; // Start items after header on new page
        y = addTableHeader(y);
      }

      // Add item details
      doc.text(item.good.name, margin, y);
      doc.text(item.qty.toString(), 280, y);
      doc.text(formatMoney(item.sellingPrice), 330, y);
      doc.text(
        formatMoney(item.sellingPrice * item.qty),
        pageWidth - margin,
        y,
        { align: "right" }
      );

      // Add horizontal line
      y += 20;
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;
    }

    // Check if we need a new page for totals
    if (y > pageHeight - 120) {
      addFooter();
      doc.addPage();
      addHeader();
      y = 120;
    }

    // Add totals
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", 330, y);
    doc.text(formatMoney(subTotal), pageWidth - margin, y, { align: "right" });

    y += 20;
    doc.text("Discount:", 330, y);
    doc.text(formatMoney(discount), pageWidth - margin, y, { align: "right" });

    y += 20;
    doc.setFontSize(12);
    doc.text("Total:", 330, y);
    doc.text(formatMoney(total), pageWidth - margin, y, { align: "right" });

    // Add footer to the last page
    addFooter();

    // Save the PDF
    doc.save(`Invoice-${formatInvoiceNumber(props.orderNo)}.pdf`);
  };

  return (
    <>
      <Button
        onClick={generatePDF}
        variant={"outline"}
        className="w-[40px] p-0 h-[40px] grow-0 shrink-0"
      >
        <Download size={28} strokeWidth={1.5} />
      </Button>

      {/* Preview component for reference - actual PDF is generated directly with jsPDF */}
      <div
        className="w-[595px] mx-auto border border-[#ccc] min-h-[842px] font-nunito text-black p-12"
        ref={receiptRef}
      >
        <header className="flex flex-col">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col items-start justify-start gap-2">
              <Image
                src="/logo.png"
                width={50}
                height={50}
                alt="logo"
                className="rounded-full"
              />
              <h1 className="text-3xl font-bold mt-4">Invoice</h1>
            </div>
            <div className="flex flex-col items-end justify-start">
              <h2 className="font-semibold">{companyName}</h2>
              <p className="text-xs">{companyStreetAddress}</p>
              <p className="text-xs">{companyRegion}</p>
              <p className="text-xs">{companyCountry}</p>
              <p className="text-xs">{companyPhoneNumber}</p>
              <p className="text-xs">VAT ID: {companyVatId || "N/A"}</p>
            </div>
          </div>

          <hr className="border-gray-300 my-8" />

          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col items-start justify-start">
              <h3 className="font-semibold text-sm">INVOICE NUMBER</h3>
              <p className="text-sm font-bold">{formatInvoiceNumber(props.orderNo)}</p>

              <h3 className="font-semibold text-sm mt-4">DATE</h3>
              <p className="text-sm">{formatDate(props.createdAt)}</p>

              <h3 className="font-semibold text-sm mt-4">BALANCE DUE</h3>
              <p className="text-sm font-bold">{formatMoney(total)}</p>
            </div>

            <div className="flex flex-col items-end justify-start">
              <h3 className="font-semibold text-sm">BILL TO</h3>
              <p className="text-sm font-bold">{props.buyer.name}</p>
              <p className="text-sm">{props.buyer.email}</p>
              <p className="text-sm">{props.buyer.phone}</p>
            </div>
          </div>
        </header>

        <hr className="border-gray-300 my-8" />

        <table className="w-full mt-8">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left pb-2 font-semibold text-sm">ITEM</th>
              <th className="text-left pb-2 font-semibold text-sm">QTY</th>
              <th className="text-left pb-2 font-semibold text-sm">UNIT PRICE</th>
              <th className="text-right pb-2 font-semibold text-sm">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item, id) => (
              <tr key={id} className={`${rowColor()} border-b border-gray-200`}>
                <td className="py-4 text-sm">{item.good.name}</td>
                <td className="py-4 text-sm">{item.qty}</td>
                <td className="py-4 text-sm">{formatMoney(item.sellingPrice)}</td>
                <td className="py-4 text-sm text-right">
                  {formatMoney(item.sellingPrice * item.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex flex-col items-end">
          <div className="flex justify-between w-64 py-2">
            <span className="font-semibold text-sm">Subtotal:</span>
            <span className="text-sm">{formatMoney(subTotal)}</span>
          </div>
          <div className="flex justify-between w-64 py-2 border-b border-gray-300">
            <span className="font-semibold text-sm">Discount:</span>
            <span className="text-sm">{formatMoney(discount)}</span>
          </div>
          <div className="flex justify-between w-64 py-2 mt-2 font-bold">
            <span className="text-base">Total:</span>
            <span className="text-base">{formatMoney(total)}</span>
          </div>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-sm text-gray-600 italic">
            Thank you for doing business with us. Have a great day.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Generated on {formatDate(new Date().toISOString())}
          </p>
        </footer>
      </div>
    </>
  );
};

export default OrderReceipt;