"use client";
import { FC, useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { formatCurrencyShort } from "@/lib/utils";
import Link from "next/link";

interface BestPerformerProps {
  before: string;
  after: string;
}
const BestPerformer: FC<Partial<BestPerformerProps>> = ({ before, after }) => {
  const [goods, setGoods] = useState<any>([]);
  const dateOptions = {
    day: "numeric" as "numeric",
    month: "long" as "long",
    year: "numeric" as "numeric",
  };
  const dateF = new Intl.DateTimeFormat("en-US", dateOptions);
  const fetchGoods = async (before?: string, after?: string) => {
    try {
      let query = "?";
      if (before) query += `&b=${encodeURIComponent(before)}`;
      if (after) query += `&a=${encodeURIComponent(after)}`;
      if (!(before || after)) query = "";
      const response = await axios.get(
        `/api/insights/best-performing-goods${query}`
      );
      if (response.status !== 200) {
        throw response;
      }
      let data = response.data;
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoods(before, after).then((data) => setGoods(data));
  }, [before, after]);
  return (
    <div className="self-stretch border border-[#FFE082] h-full w-full bg-[#FFF8E1] rounded-md shadow-md overflow-auto">
      <h3 className="sticky left-0 text-lg text-[#B28704] p-4 flex flex-row flex-wrap gap-3 items-center justify-between w-full font-semibold font-quicksand bg-[#FFECB3]">
        Best performing products
        <Button variant={"outline"} className="font-semibold border-[#FFD54F] text-[#B28704] hover:bg-[#FFECB3]" asChild>
          <a href="#actions/product/add-new">Add a new Product</a>
        </Button>
      </h3>
      <table className="relative w-full rounded-md mb-4">
        <thead className="sticky top-0 bg-[#FFECB3] text-[14px] font-rambla font-bold text-[#B28704] border-b z-10 border-[#FFE082]">
          <tr>
            <th className="text-left px-4 py-2 sticky left-0 bg-[#FFECB3]">Name</th>
            <th className="text-left px-4 py-2 bg-[#FFECB3]">Category</th>
            <th className="text-left px-4 py-2 bg-[#FFECB3]">Qty in Stock</th>
            <th className="text-left px-4 py-2 bg-[#FFECB3]">Units Sold</th>
            <th className="text-left px-4 py-2 bg-[#FFECB3]">Revenue Generated</th>
          </tr>
        </thead>
        <tbody>
          {goods &&
            goods.map((good: any, idx: number) => {
              return (
                <tr key={idx} className="text-[13px] border-b border-[#FFE082] p-1 hover:bg-[#FFF3E0]">
                  <td className="font-rambla font-semibold sticky left-0 bg-[#FFF8E1] px-4 py-2 hover:underline hover:cursor-pointer text-[#B28704]">
                    <Link
                      href={`/inventory/products?product=${good.id}`}
                      className="h-full w-full"
                    >
                      {good.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-[#B28704]">{good.category[0]}</td>
                  <td className="px-4 py-2 text-[#B28704]">{good.stock}</td>
                  <td className="px-4 py-2 text-[#B28704]">{good.qtySold}</td>
                  <td className="px-4 py-2 text-[#B28704]">
                    {formatCurrencyShort(good.revenue)}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default BestPerformer;
