import React from 'react';
import { ExternalInvoiceStoreProvider } from '@/lib/providers/invoice-store-provider';

export const metadata = {
    title: "Quick Receipts"
};


export default function ReceiptLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <ExternalInvoiceStoreProvider>
            {children}
        </ExternalInvoiceStoreProvider>
    )
} 