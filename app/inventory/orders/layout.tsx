import React from 'react';
import { OrderStoreProvider } from '@/lib/providers/order-store-provider';

export const metadata = {
  title: "Orders",
};


export default function OrderLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <OrderStoreProvider>
            {children}
        </OrderStoreProvider>
    )
}
