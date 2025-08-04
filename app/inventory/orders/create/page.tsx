import { Metadata } from "next";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { OrderStoreProvider } from "@/lib/providers/order-store-provider";
import Order from "@/lib/inventory/models/order";
import CreateInvoice from "./main";
import InsightsDAO from "@/lib/inventory/dao/insights";

export const metadata: Metadata = {
  title: "Invoice | Create",
  description: "Create a new invoice",
};

async function Page() {
  // get new order number
  const lastOrder = await Order.find({}).sort({ orderNo: -1 }).limit(1);
  const orderNo = lastOrder.length ? lastOrder[0].orderNo + 1 : 1;
  const topGoods = (await InsightsDAO.getTopTenSellingGoods()).map((good) => ({
    id: good.productId,
    name: good.name,
    costPrice: good.costPrice,
    qtyInStock: good.stock,
  }));
  return (
    <main className="flex flex-col absolute top-[60px] gap-4 h-full w-full justify-start items-start p-2">
      <div className="flex w-full justify-start items-start pt-1">
        <Link
          href="/inventory/orders"
          className="text-black hover:text-pri-5  bg-white p-2 border-2 rounded-sm border-neu-4 transition"
        >
          <MoveLeft size={20} />
        </Link>
        <div className="flex flex-col items-start justify-center ml-2">
          <h1 className="text-xl font-bold text-gray-800">Create Invoice</h1>
          <h6 className="text-gray-400 text-xs">
            {new Date().toLocaleDateString()}
          </h6>
        </div>
      </div>
      <OrderStoreProvider>
        <CreateInvoice invoiceNumber={orderNo} topGoods={topGoods} />
      </OrderStoreProvider>
    </main>
  );
}

export default Page;