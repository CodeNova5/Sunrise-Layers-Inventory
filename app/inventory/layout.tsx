import { Metadata } from "next";
import InventoryProviders from "./providers";
import Inventory from "./inventory";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Inventory",
  applicationName: "Inventory",
  authors: [{ name: "Dave Mcsavvy", url: "https://mcsavvy.is-a.dev" }],
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InventoryProviders>
      <Inventory>
        {children}
      </Inventory>
    </InventoryProviders>
  );
}