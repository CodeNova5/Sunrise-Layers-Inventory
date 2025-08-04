"use client";
import React, { useEffect, useState, useRef } from "react";
import { useQueryState } from "nuqs";
import Modal from "@/components/ui/modal";
import { fetchPayment } from "@/lib/stores/payment-store";
import { Payment } from "@/lib/@types/payments";
import { formatInvoiceNumber, formatMoney, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Phone } from "lucide-react";
import jsPDF from "jspdf";
import Image from "next/image";
import {
  companyName,
  companyPhoneNumber,
  companyAddress,
  companyStreetAddress,
  companyRegion,
  companyCountry,
  companyVatId
} from "@/data";

export default function PaymentReceiptModal() {
  const [paymentId, setPaymentId] = useQueryState("payment", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const [payment, setPayment] = useState<Payment | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const modalId = "payment/receipt";

  useEffect(() => {
    if (paymentId) {
      fetchPayment(paymentId).then(setPayment);
    }
  }, [paymentId]);

  const generatePDF = () => {
    if (!payment) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;

    // Set accent color
    const accentColor = "#444444";

    // Add header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentColor);
    doc.text(companyName, margin, margin + 7);

    // Add company info on right
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(companyName, pageWidth - margin, margin, { align: "right" });
    doc.text(companyStreetAddress || companyAddress, pageWidth - margin, margin + 15, { align: "right" });
    doc.text(companyRegion + ", " + companyCountry, pageWidth - margin, margin + 30, { align: "right" });
    doc.text(companyPhoneNumber, pageWidth - margin, margin + 45, { align: "right" });

    // Add receipt title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Receipt", pageWidth / 2, 120, { align: "center" });

    // Add invoice reference
    doc.setFontSize(14);
    doc.text(`Invoice ${formatInvoiceNumber(payment.order.orderNo)}`, pageWidth / 2, 150, { align: "center" });

    // Add horizontal line
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(1);
    doc.line(margin, 170, pageWidth - margin, 170);

    // Add receipt details
    const startY = 200;
    const lineHeight = 30;
    let currentY = startY;

    // Helper function to add a receipt line with label and value
    const addReceiptLine = (label: string, value: string) => {
      const labelWidth = 180;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, currentY);

      doc.setFont("helvetica", "normal");
      doc.text(value, margin + labelWidth, currentY);

      // Add dotted line under value
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin + labelWidth - 10, currentY + 5, pageWidth - margin, currentY + 5);
      doc.setLineDashPattern([], 0); // Reset to solid line

      currentY += lineHeight;
    };

    // Date
    addReceiptLine("Date:", formatDate(payment.createdAt));

    // Customer
    addReceiptLine("Received with thanks from:", payment.customer.name);

    // Amount
    addReceiptLine("Amount:", formatMoney(payment.amount));

    // Invoice Number
    addReceiptLine("Invoice:", formatInvoiceNumber(payment.order.orderNo));

    // Received By
    addReceiptLine("Received By:", payment.confirmedBy.name);

    // Add horizontal line
    currentY += 20;
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(1);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    // Add footer
    const footerY = pageHeight - 50;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Thank you for your payment.",
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

    // Save the PDF
    doc.save(`Payment-Receipt-${formatInvoiceNumber(payment.order.orderNo)}.pdf`);
  };

  const title = payment ? (
    <span>
      Payment Receipt For{" "}
      <Link href={`/orders/${payment.order.id}`} className="text-primary">
        {formatInvoiceNumber(payment.order.orderNo)}
      </Link>
    </span>
  ) : (
    <span>Payment Receipt</span>
  );

  return (
    <Modal
      id={modalId}
      title={title}
      onClose={() => {
        setPaymentId("");
        setPayment(null);
      }}
      classNames={{
        title: "text-lg text-black",
        modal: "scrollbar-thin",
        content: "max-w-screen overflow-y-auto",
      }}
    >
      {/* Receipt Preview */}
      <div
        className="w-[595px] mx-auto border border-[#ccc] min-h-[500px] font-nunito text-black p-12"
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
              <h1 className="text-3xl font-bold mt-4">Payment Receipt</h1>
            </div>
            <div className="flex flex-col items-end justify-start">
              <h2 className="font-semibold">{companyName}</h2>
              <p className="text-xs">{companyAddress}</p>
              <p className="text-xs">{companyRegion}, {companyCountry}</p>
              <p className="text-xs flex items-center">
                <Phone size={12} className="mr-1" />
                {companyPhoneNumber}
              </p>
            </div>
          </div>

          <div className="text-center mt-6 mb-2">
            <p className="text-lg font-bold">
              Invoice {payment && formatInvoiceNumber(payment.order.orderNo)}
            </p>
          </div>

          <hr className="border-gray-300 my-8" />

          <div className="mt-8 space-y-6">
            <div className="flex">
              <p className="font-bold w-48">Date:</p>
              <div className="flex-grow border-b border-dotted border-gray-500">
                <p className="text-center">
                  {payment && formatDate(payment.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex">
              <p className="font-bold w-48">Received with thanks from:</p>
              <div className="flex-grow border-b border-dotted border-gray-500">
                <p className="text-center">
                  {payment?.customer.name}
                </p>
              </div>
            </div>

            <div className="flex">
              <p className="font-bold w-48">Amount:</p>
              <div className="flex-grow border-b border-dotted border-gray-500">
                <p className="text-center font-bold">
                  {payment && formatMoney(payment.amount)}
                </p>
              </div>
            </div>

            <div className="flex">
              <p className="font-bold w-48">Invoice:</p>
              <div className="flex-grow border-b border-dotted border-gray-500">
                <p className="text-center">
                  {payment && formatInvoiceNumber(payment.order.orderNo)}
                </p>
              </div>
            </div>

            <div className="flex">
              <p className="font-bold w-48">Received By:</p>
              <div className="flex-grow border-b border-dotted border-gray-500">
                <p className="text-center">
                  {payment?.confirmedBy.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        <footer className="mt-24 text-center">
          <p className="text-sm text-gray-600 italic">
            Thank you for your payment.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Generated on {formatDate(new Date().toISOString())}
          </p>
        </footer>
      </div>

      <div className="flex items-center justify-end mt-4">
        <Button onClick={generatePDF}>
          <Download size={16} className="mr-2" />
          Download Receipt
        </Button>
      </div>
    </Modal>
  );
}