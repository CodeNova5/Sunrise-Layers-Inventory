"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { formatCurrencyShort, formatDate } from "@/lib/utils";
import {
  companyName,
  companyEmail,
  companyPhoneNumber,
  companyAddress,
  companyStreetAddress,
  companyRegion,
  companyCountry,
  companyVatId
} from "@/data";

interface PDFReceiptProps {
  id: string;
  createdAt: string;
  items: {
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }[];
  client: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  discount: number;
  tax: number;
  shipping: number;
  type: "receipt" | "invoice";
}

const PDFReceipt: React.FC<PDFReceiptProps> = ({
  id,
  createdAt,
  items,
  client,
  discount,
  tax,
  shipping,
  type,
}) => {
  const generatePDF = () => {
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
      doc.text(companyStreetAddress || companyAddress, pageWidth - margin, margin + 15, { align: "right" });
      doc.text(companyRegion + ", " + companyCountry, pageWidth - margin, margin + 30, { align: "right" });
      doc.text(companyPhoneNumber, pageWidth - margin, margin + 45, { align: "right" });
      doc.text(companyEmail, pageWidth - margin, margin + 60, { align: "right" });
      if (companyVatId) {
        doc.text("VAT ID: " + companyVatId, pageWidth - margin, margin + 75, { align: "right" });
      }
    };

    // Function to add footer to a page
    const addFooter = () => {
      const footerY = pageHeight - 50;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Thank you for your business.",
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

    // Add receipt/invoice title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(type === "receipt" ? "Receipt" : "Invoice", margin, 160);

    // Add horizontal line
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(1);
    doc.line(margin, 183, pageWidth - margin, 183);

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal - discountAmount + taxAmount + shipping;

    // Add receipt/invoice details
    const customerInfoTop = 197;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${type === "receipt" ? "Receipt" : "Invoice"} No:`, margin, customerInfoTop);
    doc.setFont("helvetica", "bold");
    doc.text(id.slice(0, 8), margin + 100, customerInfoTop);

    doc.setFont("helvetica", "normal");
    doc.text("Date:", margin, customerInfoTop + 15);
    doc.text(formatDate(createdAt), margin + 100, customerInfoTop + 15);

    doc.text("Balance Due:", margin, customerInfoTop + 30);
    doc.text(formatCurrencyShort(0), margin + 100, customerInfoTop + 30); // For receipts, balance is always 0

    // Add customer information
    doc.setFont("helvetica", "bold");
    doc.text(client.fullName, 300, customerInfoTop);
    doc.setFont("helvetica", "normal");
    doc.text(client.email, 300, customerInfoTop + 15);
    doc.text(client.phone, 300, customerInfoTop + 30);

    // Handle multiline address with word wrapping
    const addressLines = doc.splitTextToSize(client.address, 200);
    for (let i = 0; i < addressLines.length; i++) {
      doc.text(addressLines[i], 300, customerInfoTop + 45 + (i * 15));
    }

    // Add horizontal line
    doc.line(margin, 250, pageWidth - margin, 250);

    // Add invoice table header
    let invoiceTableTop = 280;
    const addTableHeader = (y: number) => {
      doc.setFont("helvetica", "bold");
      doc.text("Item", margin, y);
      doc.text("Description", margin + 150, y);
      doc.text("Qty", 350, y);
      doc.text("Price", 400, y);
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
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check if we need a new page
      if (y > pageHeight - 180) { // Leave room for totals and footer
        addFooter();
        doc.addPage();
        addHeader();
        y = 120; // Start items after header on new page
        y = addTableHeader(y);
      }

      // Add item name with word wrapping if necessary
      const nameLines = doc.splitTextToSize(item.name, 140);
      for (let j = 0; j < nameLines.length; j++) {
        doc.text(nameLines[j], margin, y + (j * 12));
      }

      // Add description with word wrapping if necessary
      if (item.description) {
        const descLines = doc.splitTextToSize(item.description, 140);
        for (let j = 0; j < descLines.length; j++) {
          doc.text(descLines[j], margin + 150, y + (j * 12));
        }
      } else {
        doc.text("-", margin + 150, y);
      }

      // Add other item details
      doc.text(item.quantity.toString(), 350, y);
      doc.text(formatCurrencyShort(item.price), 400, y);
      doc.text(
        formatCurrencyShort(item.price * item.quantity),
        pageWidth - margin,
        y,
        { align: "right" }
      );

      // Add horizontal line
      const lineY = y + 20;
      doc.line(margin, lineY, pageWidth - margin, lineY);
      y = lineY + 20;
    }

    // Check if we need a new page for totals
    if (y > pageHeight - 150) {
      addFooter();
      doc.addPage();
      addHeader();
      y = 120;
    }

    // Add totals
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 350, y);
    doc.text(formatCurrencyShort(subtotal), pageWidth - margin, y, { align: "right" });

    y += 20;
    doc.text(`Discount (${discount}%):`, 350, y);
    doc.text(formatCurrencyShort(discountAmount), pageWidth - margin, y, { align: "right" });

    y += 20;
    doc.text(`Tax (${tax}%):`, 350, y);
    doc.text(formatCurrencyShort(taxAmount), pageWidth - margin, y, { align: "right" });

    y += 20;
    doc.text("Shipping:", 350, y);
    doc.text(formatCurrencyShort(shipping), pageWidth - margin, y, { align: "right" });

    y += 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", 350, y);
    doc.text(formatCurrencyShort(total), pageWidth - margin, y, { align: "right" });

    y += 25;
    doc.text("Payment Status:", 350, y);
    doc.setTextColor(0, 128, 0); // Green color for PAID
    doc.text("PAID", pageWidth - margin, y, { align: "right" });

    // Add footer to the last page
    addFooter();

    // Save the PDF
    const fileName = type === "receipt" ? `Receipt-${id.slice(0, 8)}.pdf` : `Invoice-${id.slice(0, 8)}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="flex items-center gap-2">
      <Download size={16} />
      Download {type === "receipt" ? "Receipt" : "Invoice"}
    </Button>
  );
};

export default PDFReceipt;