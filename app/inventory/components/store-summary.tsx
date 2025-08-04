"use client"
import { FC, useState, useEffect } from 'react';
import axios from "@/lib/axios";
import { Button } from '@/components/ui/button';
import { formatCurrencyShort, formatPercentage } from '@/lib/utils';
import Link from 'next/link';
import { CircleDollarSign, ShoppingCart, ReceiptText, TrendingUp, TrendingDown } from 'lucide-react'

interface StoreSummaryProps {
    before: string;
    after: string;
}
interface ProductVal {
    name: string;
    id: string;
    qtySold: number;
    revenue: number;
    orderCount: number;
    profitPercentage: number

}
const StoreSummary: FC<Partial<StoreSummaryProps>> = ({ before, after }) => {
    const [mvp, setMVP] = useState<ProductVal | null>(null)
    const [mpp, setMPP] = useState<ProductVal | null>(null)
    const [store, setStore] = useState({ inStock: 0, lowStock: 0, noStock: 0, total: 0 })
    const toPercent = (val: number, rev: boolean = false) => {
        let percentage;
        if (store.total <= 0) percentage = 0;
        else percentage = (val / store.total) * 100;
        if (rev) percentage = 100 - percentage;
        return `${percentage}%`;
    }
    const inStock = `${toPercent(store.inStock)}`
    const inDiff = `${toPercent(store.inStock, true)}`
    const lowStock = `${toPercent(store.lowStock)}`
    const lowDiff = `${toPercent(store.lowStock, true)}`
    const noStock = `(${toPercent(store.noStock)}`
    const noDiff = `${toPercent(store.noStock, true)}`

    const fetchSummary = async (before?: string, after?: string) => {
        try {
            let query = '?'
            if (before) query += `&b=${encodeURIComponent(before)}`;
            if (after) query += `&a=${encodeURIComponent(after)}`;
            if (!(before || after)) query = '';
            const response = await axios.get(`/api/insights/store-summary${query}`)
            if (response.status !== 200) {
                throw response;
            }
            let data = response.data;
            return data
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchSummary(before, after).
            then(({ mvp, mpp, ...storeSummary }) => {
                setMVP(mvp)
                setMPP(mpp)
                setStore(storeSummary || {})
            })
    }, [before, after])
    return (
        <div className="self-stretch h-full flex flex-col justify-between gap-2  border border-neu-3 overflow-y-auto scrollbar-thin bg-white rounded-md shadow-inner p-4">
            <h3 className="text-lg text-pri-5 font-semibold font-quicksand flex items-center justify-between">Store overview
                <Link href="/inventory/products">
                    <Button variant={"outline"} className="font-semibold">Go to store</Button>
                </Link>
            </h3>
            <div>
                <p className="text-sm text-neu-6">In stock</p>
                <div className="flex flex-wrap justify-between items-center">
                    <span className="text-lg font-bold text-pri-5">{store.inStock}</span><span className='text-[13px] text-pri-5'>/{store.total}</span>
                    <span className="w-full h-[40px] flex flex-row">
                        {/* @ts-ignore */}
                        <span className="h-full progress-bar" style={{ "--progress": 'var(--pri-500)', width: inStock }}></span>
                        {/* @ts-ignore */}
                        <span className="h-full progress-bar" style={{ "--progress": 'var(--pri-200)', width: inDiff }}></span>
                    </span>
                </div>
            </div>
            <div>
                <p className="text-sm text-neu-6">Low stock</p>
                <div className="flex flex-wrap justify-between items-center">
                    <span className="text-lg font-bold text-acc-6">{store.lowStock}</span ><span className='text-[13px] text-acc-6'>/{store.total}</span>
                    <span className="w-full h-[40px] flex flex-row">
                        {/* @ts-ignore */}
                        <span className="h-full progress-bar" style={{ "--progress": 'var(--acc-600)', width: lowStock }}></span>
                        {/* @ts-ignore */}
                        <span className="h-full progress-bar" style={{ "--progress": 'var(--acc-300)', width: lowDiff }}></span>
                    </span>
                </div>
            </div>
            <div>
                <p className="text-sm text-neu-6">Out of stock</p>
                <div className="flex flex-wrap justify-between items-center">
                    <span className="text-lg font-bold text-red-500">{store.noStock}</span><span className='text-[13px] text-red-500'>/{store.total}</span>
                    <span className="w-full h-[40px] flex flex-row">
                        {/* @ts-ignore */}
                        <span className="h-full progress-bar" style={{ "--progress": 'red', width: noStock }}></span>
                        {/* @ts-ignore */}
                        <span className="h-full progress-bar" style={{ "--progress": 'var(--red-light)', width: noDiff }}></span>
                    </span>
                </div>
            </div>
        </div >
    )
}

export default StoreSummary