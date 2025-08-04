import { GoodStoreProvider } from "@/lib/providers/good-store-provider";

export const metadata = {
  title: "Products",
};


export default function OverviewLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <GoodStoreProvider>
            {children}
        </GoodStoreProvider>
    );
}
