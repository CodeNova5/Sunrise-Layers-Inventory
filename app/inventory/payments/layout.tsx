import { PaymentStoreProvider } from "@/lib/providers/payment-store-provider";
import PaymentReceiptModal from "./components/receipt-modal";

export const metadata = {
  title: "Payments",
};


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PaymentStoreProvider>
      <PaymentReceiptModal />
      {children}
    </PaymentStoreProvider>
  );
}
