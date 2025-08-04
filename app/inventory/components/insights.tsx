"use client"
import { RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect, FC } from 'react'
import axios from '@/lib/axios';
import { OrderInsights } from '@/lib/@types/insights';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
import { Bar } from 'react-chartjs-2';
import { formatCurrencyShort } from '@/lib/utils';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)
interface InsightProps {
    metric: string;
    before: string;
    after: string;
}
const Insights: FC<InsightProps> = ({ metric, before, after }) => {
    const [insights, setInsights] = useState<OrderInsights[]>([])
    const [summary, setSummary] = useState<any>({})
    const [chartData, setCharData] = useState<any>()
    const [profit, setP] = useState(0)

    const generateYearRange = (before: string, after: string): string[] => {
        const startYear = new Date(after).getFullYear();
        const endYear = new Date(before).getFullYear();
        return Array.from(
            { length: endYear - startYear + 1 },
            (_, index) => (startYear + index).toString()
        );
    };
    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const totalRevenueDataset = context.chart.data.datasets.find((dataset: any) => dataset.label === 'Total Revenue');
                        const totalRevenueValue = totalRevenueDataset.data[context.parsed.x];
                        return `Total Revenue: ${totalRevenueValue}`;
                    }
                }
            }
        },
        scales: {
            y: {
                display: false,
                grid: {
                    display: true,
                },
                stacked: true,
            },
            x: {
                grid: {
                    display: false,
                },
                stacked: true,
            },
        },
        barPercentage: 1,
        categoryPercentage: 0.8,
    }
    const metrics: { [key: string]: string[] } = {
        'month': ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        'day': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'hour': ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'],
        'year': generateYearRange(before, after)
    }

    const fetchInsights = async () => {
        try {
            let query = ''
            if (before) query += `&b=${encodeURIComponent(before)}`;
            if (after) query += `&a=${encodeURIComponent(after)}`;
            const response = await axios.get(`/api/insights/orders?m=${metric}${query}`)
            if (response.status !== 200) {
                throw response;
            }
            const data: OrderInsights[] = response.data.results;
            const summary = response.data.summary
            return { data, summary }
        } catch (err) {
            console.error(err)
        }
    }
    useEffect(() => {
        fetchInsights()
            .then((data) => {
                if (data && data.data && data.summary) {
                    setInsights(data.data)
                    setSummary(data.summary)
                }
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metric, before, after])
    useEffect(() => {
        if (insights) {
            const labels = metrics[metric] as string[];
            const totalRevenue = insights.reduce((total, insight) => total + insight.totalRevenue, 0);
            const totalCost = insights.reduce((total, insight) => total + insight.totalCost, 0);
            setP(Math.round((totalRevenue - totalCost) * 100) / 100);
            const maxValue = Math.max(...insights.map(item => item.totalRevenue))
            const maxRevenue = maxValue + (maxValue / 4) || 1000;
            const offset = maxRevenue * 0.05;
            setCharData({
                labels,
                datasets: [
                    {
                        id: 1,
                        label: 'Total Revenue',
                        data: insights.map(item => item.totalRevenue),
                        backgroundColor: '#002536',
                        borderSkipped: false,
                        borderRadius: {
                            topLeft: 10,
                            topRight: 10,
                            bottomLeft: 0,
                            bottomRight: 0,
                        }
                    },
                    {
                        id: 2,
                        label: '',
                        data: insights.map(item => maxRevenue - item.totalRevenue),
                        backgroundColor: '#70A0EC',
                        borderSkipped: false,
                        borderRadius: {
                            topLeft: 10,
                            topRight: 10,
                            bottomLeft: 0,
                            bottomRight: 0,
                        },
                        base: 0,
                    },
                ],
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [insights, metric]);

    // ...existing code...
return (
  <>
    <div className="w-full h-full bg-[#FFF8E1] flex self-start items-start justify-center border border-[#FFE082] shadow-md overflow-auto min-h-[200px]">
      <div className="h-full w-full bg-[#FFECB3] p-4 flex grow flex-col gap-3 rounded-md">
        <h3 className="flex flex-col text-lg text-[#B28704] font-semibold font-quicksand">
          Revenue Summary
        </h3>
        {insights.length > 0 && <Bar data={chartData} options={options} className='my-auto' />}
      </div>
    </div>
    <div className="self-start h-full flex flex-col gap-y-4 border border-[#FFE082] shadow-md min-h-[250px] w-full p-4 bg-[#FFF8E1] rounded-md">
      <h3 className="text-lg text-[#B28704] font-semibold font-quicksand truncate">
        Order Summary For Period
      </h3>
      <p
        className={`font-semibold text-4xl text-center mt-4 font-quicksand ${
          profit >= 0 ? (profit > 0? "text-green-600" : "text-gray-500") : "text-red-500"
        }`}
      >
        {formatCurrencyShort(profit)}
      </p>
      {Object.keys(summary).length > 0 && (
        <>
          <ul className="flex flex-col gap-y-2 items-start">
            <li className="w-full flex flex-row items-center justify-between">
              <span className="text-[#B28704]">Paid:</span>
              <span className="font-semibold text-[#B28704]">
                {summary.paid}
              </span>
            </li>
            <li className="w-full flex flex-row items-center justify-between">
              <span className="text-[#B28704]">Pending:</span>
              <span className="font-semibold text-[#B28704]">
                {summary.pending}
              </span>
            </li>
            <li className="w-full flex flex-row items-center justify-between">
              <span className="text-[#B28704]">Interested:</span>
              <span className="font-semibold text-[#B28704]">
                {summary.rest}
              </span>
            </li>
            <li className="w-full flex flex-row items-center justify-between">
              <span className="text-[#B28704]">Cancelled:</span>
              <span className="font-semibold text-[#B28704]">
                {summary.cancelled}
              </span>
            </li>
            <li className="w-full flex flex-row items-center justify-between">
              <span className="text-[#B28704]">Errors:</span>
              <span className="font-semibold text-[#B28704]">
                {summary.errors}
              </span>
            </li>
            <li className="w-full flex flex-row items-center justify-between font-semibold text-lg">
              <span className="text-[#B28704]">Total:</span>
              <span className="font-semibold text-[#B28704]">
                {summary.total}
              </span>
            </li>
          </ul>
        </>
      )}
    </div>
  </>
);
// ...existing code...
}

export default Insights