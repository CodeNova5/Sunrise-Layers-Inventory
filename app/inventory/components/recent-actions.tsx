import Overdue from "./overdue-order";
import Recents from "./recents";
import { Button } from "@/components/ui/button";
import {
  Boxes,
  Users,
  ReceiptText,
  UsersRound,
  CircleDollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  LoaderPinwheel,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import axios from "@/lib/axios";
import { formatCurrencyShort, formatPercentage } from "@/lib/utils";
import { DashboardProps } from "@/lib/@types/dashboard";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { useRouter } from "next/navigation";

interface ProductVal {
  name: string;
  id: string;
  qtySold: number;
  revenue: number;
  orderCount: number;
  profitPercentage: number;
}

const RecentActions: FC<Partial<DashboardProps>> = ({ before, after }) => {
  const [mvp, setMVP] = useState<ProductVal | null>(null);
  const [search, setS] = useState(false);
  const [mpp, setMPP] = useState<ProductVal | null>(null);
  const [clicked, setClicked] = useState(false);
  const windowWidth = useWindowWidth();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(
    new Date(startOfWeek).setDate(startOfWeek.getDate() + 6)
  );

  const isLargeScreen = windowWidth > 768;
  const router = useRouter();
  const ctab = [
    {
      front: "Create Invoice",
      icon: ReceiptText,
      link: "/inventory/orders/create",
    },
    {
      front: "Register Customer",
      icon: UsersRound,
      link: "#actions/buyer/create",
    },
    { front: "New Product", icon: Boxes, link: "#actions/product/add-new" },
    { front: "Add Staff", icon: Users, link: "#actions/staff/create" },
  ];
  const fetchSummary = async (before?: string, after?: string) => {
    try {
      let query = "?";
      if (before) query += `&b=${encodeURIComponent(before)}`;
      if (after) query += `&a=${encodeURIComponent(after)}`;
      if (!(before || after)) query = "";
      const response = await axios.get(
        `/api/insights/overall-best-products-per-period${query}`
      );
      if (response.status !== 200) {
        throw response;
      }
      return response.data;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setS(true);
    fetchSummary(before, after).then(({ mvp, mpp }) => {
      setMVP(mvp);
      setMPP(mpp);
      setS(false);
    });
  }, [before, after]);
  return (
    <div className="flex flex-col w-full gap-6">
      {/* Recents and Overdue Section (was right-hand before) */}
      <div className="flex flex-col gap-3 w-full">
        <Recents
          before={endOfWeek.toISOString()}
          after={startOfWeek.toISOString()}
        />
        

      </div>
      {/* Staff and Stock Setup Section */}
      <div id="staff-stock-setup" className="w-full">
        <h3 className="font-rambla text-xl text-pri-6 font-bold mb-4">
          Staff and Stock Setup
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ctab.map(({ front, icon: Icon, link }, idx) => (
            <div
              key={idx}
              className="bg-[#FBE8A6] text-greeens hover:scale-[1.02] transition-transform cursor-pointer rounded-xl p-4 shadow-md flex flex-col items-center justify-center gap-3"
              onClick={() => {
                if (link.startsWith("#")) window.location.hash = link;
                else router.push(link);
              }}
            >
              <Icon size={28} strokeWidth={2} />
              <p className="text-center text-sm font-semibold">{front}</p>
            </div>
          ))}
        </div>
      </div>

      <Overdue />

      {/* Store Highlights Section */}
      <div className="w-full flex flex-col gap-6">
        <h3
          className="font-rambla text-lg w-full font-semibold flex flex-row items-center justify-between text-pri-6 pr-4 cursor-pointer"
          onClick={() => !isLargeScreen && setClicked(!clicked)}
        >
          <span>Your store highlights</span>
          {!isLargeScreen &&
            (clicked ? (
              <ChevronDown strokeWidth={1.5} size={24} color={"#003056"} />
            ) : (
              <ChevronRight strokeWidth={1.5} size={24} color={"#003056"} />
            ))}
        </h3>

        {(clicked || isLargeScreen) && (
          <>
            {/* MVP Section */}
            <div className="rounded-md min-h-[150px] w-full border border-neu-2 bg-white flex flex-col items-center justify-center p-3 gap-3 shadow-md">
              <p className="text-sm text-neu-8">Most Valuable Product (MVP)</p>
              {search ? (
                <LoaderPinwheel
                  size={40}
                  strokeWidth={2.5}
                  color="#2D6DBE"
                  className="animate-spin"
                />
              ) : mvp ? (
                <Link
                  className="hover:cursor-pointer hover:bg-neu-1 w-full p-2"
                  href={`/inventory/products?query=${mvp.name}`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <p className="font-semibold text-pri-6 text-4xl font-rambla">
                      {mvp.name}
                    </p>
                    <ul className="flex flex-wrap justify-center gap-4">
                      <li className="flex items-center gap-1">
                        <ShoppingCart size={20} /> <span>{mvp.qtySold} sold</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <CircleDollarSign size={20} />{" "}
                        <span>{formatCurrencyShort(mvp.revenue)}</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <ReceiptText size={20} />{" "}
                        <span>
                          {mvp.orderCount} order{mvp.orderCount > 0 ? "s" : ""}
                        </span>
                      </li>
                      <li
                        className={`flex items-center gap-1 ${mvp.profitPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        {mvp.profitPercentage >= 0 ? (
                          <TrendingUp size={20} />
                        ) : (
                          <TrendingDown size={20} />
                        )}
                        <span>
                          {mvp.profitPercentage >= 0 ? "+" : "-"}
                          {formatPercentage(mvp.profitPercentage)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </Link>
              ) : (
                <p className="text-xl font-bold font-rambla text-center">
                  No record sales within the period
                </p>
              )}
            </div>

            {/* MPP Section */}
            <div className="rounded-md min-h-[150px] w-full border border-neu-2 bg-white flex flex-col items-center justify-center p-3 gap-3 shadow-md">
              <p className="text-sm text-neu-8">Most Profitable Product (MPP)</p>
              {search ? (
                <LoaderPinwheel
                  size={40}
                  strokeWidth={2.5}
                  color="#2D6DBE"
                  className="animate-spin"
                />
              ) : mpp ? (
                <Link
                  className="hover:cursor-pointer hover:bg-neu-1 w-full p-2"
                  href={`/inventory/products?query=${mpp.name}`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <p className="font-semibold text-pri-6 text-4xl font-rambla">
                      {mpp.name}
                    </p>
                    <ul className="flex flex-wrap justify-center gap-4">
                      <li className="flex items-center gap-1">
                        <ShoppingCart size={20} /> <span>{mpp.qtySold} sold</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <CircleDollarSign size={20} />{" "}
                        <span>{formatCurrencyShort(mpp.revenue)}</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <ReceiptText size={20} />{" "}
                        <span>
                          {mpp.orderCount} order{mpp.orderCount > 0 ? "s" : ""}
                        </span>
                      </li>
                      <li
                        className={`flex items-center gap-1 ${mpp.profitPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        {mpp.profitPercentage >= 0 ? (
                          <TrendingUp size={20} />
                        ) : (
                          <TrendingDown size={20} />
                        )}
                        <span>
                          {mpp.profitPercentage >= 0 ? "+" : "-"}
                          {formatPercentage(mpp.profitPercentage)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </Link>
              ) : (
                <p className="text-xl font-bold font-rambla text-center">
                  No record sales within the period
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default RecentActions;
