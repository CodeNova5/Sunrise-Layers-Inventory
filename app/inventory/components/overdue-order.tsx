"use client"
import { FC, useState, useEffect } from 'react';
import axios from "@/lib/axios";
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import { formatCurrencyShort } from '@/lib/utils';
import Link from 'next/link';

interface OverdueProps {
    before: string;
    after: string;
}
const Overdue: FC<Partial<OverdueProps>> = ({ before, after }) => {
    const [orders, setOrders] = useState<any>([])
    const dateOptions = { day: "numeric" as "numeric", month: "long" as "long", year: "numeric" as "numeric" };
    const dateF = new Intl.DateTimeFormat('en-US', dateOptions);
    const fetchOrders = async (before?: string, after?: string) => {
        try {
            let query = '?'
            if (before) query += `&b=${encodeURIComponent(before)}`;
            if (after) query += `&a=${encodeURIComponent(after)}`;
            if (!(before || after)) query = '';
            const response = await axios.get(`/api/insights/overdue-orders${query}`)
            if (response.status !== 200) {
                throw response;
            }
            let data = response.data;
            return data || []
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchOrders(before, after).
            then(data => setOrders(data))
    }, [before, after])
    return (
        <div className="h-[350px] grow  w-full flex flex-col gap-2  border border-neu-3 overflow-y-auto scrollbar-thin bg-white rounded-md shadow-inner ">
            <h3 className="w-full sticky top-0 bg-white text-lg text-red-500 font-semibold font-quicksand pt-4 px-4">Overdue orders</h3>
            <ul className="flex flex-col items-stretch cursor-pointer justify-start gap-2 px-4">
                {
                    orders && orders.map((order: any, idx: number) => {
                        return (
                            <Link key={idx} href={`/inventory/orders/${order.orderId}`}>
                                <li className="flex flex-col p-1 bg-neu-1 shadow-md">
                                    <span className=" text-bold font-rambla text-acc-7 flex flex-row items-center justify-between">
                                        #{order.orderNo.toString().padStart(5, "0")}<span className="text-red-500 ">{formatCurrencyShort(order.orderAmount - order.amountPaid)}</span></span>
                                    <span>{order.buyers_name}</span>
                                    <span>Due: <span className="text-sm text-neu-7">{dateF.format(new Date(order.dueDate))}</span></span>
                                </li>
                            </Link>
                        )
                    })
                }
            </ul>
            <Button variant="ghost" className="w-full flex gap-2 items-center justify-center" asChild>
                <Link href={`/inventory/orders?order:status=overdue`}>
                    <MoveRight />View More
                </Link>
            </Button>
        </div>
    )
}

export default Overdue