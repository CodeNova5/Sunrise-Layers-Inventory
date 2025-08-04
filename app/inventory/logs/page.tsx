"use client"
import React, { useState, useEffect } from 'react'
import LogItem from './components/log-item'
import Filters from './components/filters'
import axios from "@/lib/axios"
import Log from '@/lib/@types/log'
import { Button } from '@/components/ui/button'

const groupByDate = (logs: Log[]) => {
    return logs.reduce((acc: any, log) => {
        const date = new Date(log.createdAt).toDateString()
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(log)
        return acc
    }, {})
}
const Logs: React.FC = () => {
    const [loading, setL] = useState(false)
    const [logs, setLogs] = useState<any>([])
    const [before, setBefore] = useState<string>('')
    const [after, setAfter] = useState<string>('')
    const [action, setAction] = useState<string>('')
    const [l_type, setType] = useState<string>('')
    const [page, setPage] = useState<number | null>(null)
    const [hasPrevPage, setPrev] = useState(false)
    const [hasNextPage, setNext] = useState(false)
    const [pageCount, setCount] = useState(null)
    const [pageMeta, setPM] = useState({ prev: '', next: '' })

    const fetchLogs = async () => {
        setL(true)
        try {
            setLogs([])
            let query = '?'
            if (before) query += `&b=${encodeURIComponent(before)}`;
            if (page) query += `&p=${encodeURIComponent(page)}`;
            if (after) query += `&a=${encodeURIComponent(after)}`;
            if (action) query += `&at=${encodeURIComponent(action)}`;
            if (l_type) query += `&t=${encodeURIComponent(l_type)}`;
            if (!(before || after || action || l_type || page)) query = '';
            const res = await axios.get(`/api/logs${query}`)
            setLogs(groupByDate(res.data.logs))
            setPage(res.data.page)
            setPrev(res.data.hasPrevPage)
            setNext(res.data.hasNextPage)
            setCount(res.data.totalPages)
            setPM({ prev: res.data.prev, next: res.data.next })
        } catch (error) {
            console.log(error)
        }
        setL(false)
    }
    const onPrev = () => {
        setPage(parseInt(pageMeta.prev))
    }
    const onNext = () => {
        setPage(parseInt(pageMeta.next))
    }
    useEffect(() => {
        fetchLogs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [before, after, l_type, action, page])

    return (
        <div className="flex flex-row absolute h-[calc(100vh-60px)] top-[60px] w-full overflow-auto scrollbar-thin">
            <div className="md:p-[30px] p-3 w-[700px] max-w-[calc(100%-30px)] mx-3 mt-3 bg-white min-h-[calc(100%-3em)] h-fit rounded-md">
                {
                    (!logs || loading) ?
                        <div>
                            Loading...
                        </div> :
                        <div>
                            <ul className='mb-[100px]'>
                                {
                                    Object.keys(logs).map((date, index) => (
                                        <li key={index} className="flex flex-col gap-2 items-start justify-start">
                                            <h1 className="text-lg font-bold text-acc-7">{date}</h1>
                                            <ul className='flex flex-col items-start justify-start gap-2'>
                                                {
                                                    logs[date].map((log: Log, index: number) => (
                                                        <li key={index} className="flex items-center justify-between">
                                                            <LogItem {...log} preview={true} />
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </li>
                                    ))
                                }
                            </ul>
                            <div className="fixed bottom-0 bg-white w-[700px] max-w-[calc(100%-30px)] flex flex-row items-center justify-start gap-6 p-3  pt-0 h-[70px]">
                                <div className="flex flex-row items-center justify-start gap-3">
                                    <Button className="bg-white text-black font-extrabold text-lg px-6 py-2 rounded shadow border border-[#FFD54F] hover:bg-[#FFE082] hover:text-[#4E342E] hover:scale-105 transition-all duration-150 disabled:opacity-50" variant={"outline"} onClick={onPrev} disabled={!hasPrevPage}>
                                        Prev
                                    </Button>
                                    <Button className="bg-white text-black font-extrabold text-lg px-6 py-2 rounded shadow border border-[#FFD54F] hover:bg-[#FFE082] hover:text-[#4E342E] hover:scale-105 transition-all duration-150 disabled:opacity-50" variant={"outline"} onClick={onNext} disabled={!hasNextPage}>
                                        Next
                                    </Button>
                                </div>
                                <p className="text-[#4E342E] font-bold text-lg bg-white px-4 py-2 rounded shadow border border-[#FFD54F]">
                                    Page <span className="text-[#FFD54F] text-2xl">{page}</span> of{" "}
                                    <span className="text-[#FFD54F] text-2xl">{pageCount}</span>
                                </p>
                            </div>
                        </div>

                }
            </div>
            <Filters {...{ setBefore, setAfter, setType, setAction, setPage }} />
        </div>
    );
}

export default Logs;