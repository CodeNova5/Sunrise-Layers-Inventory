import React from 'react';
import { ExternalInvoiceStoreProvider } from '@/lib/providers/invoice-store-provider';

export const metadata = {
    title: "Invoice"
};


export default function InvoiceLayout({
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
