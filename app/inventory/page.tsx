"use client";
import Insights from "./components/insights";
import StoreSummary from "./components/store-summary";
import RecentActions from "./components/recent-actions";
import BestPerformer from "./components/best-performing-goods";
import RangeBar from "./components/range";
import { useState } from "react";


export default function Home() {
  const today = new Date();
  const [before, setBefore] = useState(
    new Date(today.setDate(today.getDate() - today.getDay() + 6)).toISOString()
  );
  const [after, setAfter] = useState(
    new Date(today.setDate(today.getDate() - today.getDay())).toISOString()
  );
  const [metric, setMetric] = useState<"month" | "hour" | "day" | "year">(
    "day"
  );
  const [tab, setTab] = useState("recent");

  return (
    <div className="pt-[60px] pb-16 w-full overflow-x-hidden overflow-y-scroll scrollbar-thin">
     <div className="w-screen px-0 overflow-x-hidden">

        <ul className="px-[30px] pt-3 pb-0 font-quicksand flex flex-row items-start gap-6">
          {[
            { key: "recent", label: "Recent" },
            { key: "chart", label: "Revenue" },
          ].map(({ key, label }) => (
            <li
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 min-w-[140px] max-w-xs text-center cursor-pointer py-3 rounded-lg transition-all duration-300 ease-in-out shadow-md
            ${tab === key
            ? "text-white scale-105 shadow-lg"
            : "bg-yellow-100 text-gray-700 hover:bg-[#FBE8A6] hover:scale-102"
            }`}
              style={{
              background: tab === key ? "#FBE8A6" : undefined,
              color: tab === key ? "#222" : undefined,
              boxShadow: tab === key ? "0 4px 20px rgba(251,232,166,0.25)" : undefined,
              transform: tab === key ? "scale(1.05)" : undefined,
              }}
            >
              <span className="font-semibold tracking-wide">{label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex p-[12px] md:p-[30px] flex-row flex-wrap gap-3 items-center justify-evenly w-full">
        <RangeBar {...{ setBefore, setAfter, setMetric, before, after }} />
        {tab == "chart" && (
          <div className="w-full md:grid md:grid-cols-[7fr_3fr] md:auto-rows-min gap-4 overflow-y-visible scrollbar-thin flex flex-col items-center">
            <Insights {...{ metric, before, after }} />
            <BestPerformer {...{ before, after }} />
            <div className="col-start-2 row-start-2 flex flex-col gap-3 invoice h-full w-full">
              <StoreSummary {...{ before, after }} />
            </div>
          </div>
        )}
        {tab == "recent" && <RecentActions />}
      </div>
    </div>
  );
}
