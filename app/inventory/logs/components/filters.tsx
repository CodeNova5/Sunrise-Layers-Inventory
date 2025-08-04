import { Button } from '@/components/ui/button'
import { ListFilter, X, RotateCcw } from 'lucide-react'
import { useState, FC } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface FilterProps {
    setBefore: (val: string) => void;
    setAfter: (val: string) => void;
    setAction: (val: string) => void;
    setType: (val: string) => void;
    setPage: (val: null) => void;
}
const Filters: FC<FilterProps> = ({ setBefore, setAfter, setAction, setType, setPage }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [a, setA] = useState<string>('')
    const [b, setB] = useState<string>('')
    const [at, setAT] = useState<string>('')
    const [t, setT] = useState<string>('')
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    }
    const setSel = (e: string, setA: any, val: string) => {
        if (e == "all") {
            setA('')
        } else {
            setA(e)
        }
        if (val== "a")
           setT(e)
        else
            setAT(e)
    }
    const clear = () => {
        setBefore('')
        setPage(null)
        setAfter('')
        setAction('')
        setType('')
        setA('')
        setB('')
        setAT('')
        setT('')
    }
    return (
        <div
            className={`w-[260px] h-[calc(100vh-60px)] flex-col flex shadow-inner right-0 items-center justify-start fixed bottom-0 bg-white border border-l-neu-4 ${isDrawerOpen ? '' : 'drawer-hidden'
                } drawer`}
        >
            <Button className='drawer-btn absolute left-[-70px] text-acc-6' variant={"ghost"} onClick={toggleDrawer}>
                {isDrawerOpen ?
                    <X strokeWidth={1.5} /> :
                    <ListFilter strokeWidth={1.5} />}
            </Button>
            <Button variant={"ghost"} className="flex flex-row gap-2 text-acc-6 text-[16px] font-semibold self-end">
                <RotateCcw size={18} onClick={clear} />
                Reset All
            </Button>
            <div className='p-3 flex flex-col items-star justify-start gap-4 w-auto'>
                <h2 className='font-rambla text-acc-6 text-lg'>Filter the Logs to your liking</h2>

                <label className="flex flex-col mb-2">
                    <span className='font-lato text-acc-4 text-[16px]'>Before</span>
                    <input value={a} type='datetime-local' className='border border-neu-3 rounded-md p-2 focus:outline-none focus:border-pri-3 font-nunito' onChange={(e) => {
                        const isoString = new Date(e.target.value).toISOString();
                        setA(e.target.value);
                        setBefore(isoString);
                    }} />
                </label>
                <label className="flex flex-col mb-2">
                    <span className='font-lato text-acc-4 text-[16px]'>After</span>
                    <input value={b} type='datetime-local' className='border border-neu-3 rounded-md p-2 focus:outline-none focus:border-pri-3 font-nunito' onChange={(e) => {
                        const isoString = new Date(e.target.value).toISOString();
                        setB(e.target.value);
                        setAfter(isoString);
                    }} />
                </label>
                <label className="flex flex-col mb-2">
                    <span className='font-lato text-acc-4 text-[16px]'>Action</span>
                    <Select value={at} onValueChange={(e) => setSel(e as string, setAction, 'a')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="create">Create</SelectItem>
                                <SelectItem value="update">Update</SelectItem>
                                <SelectItem value="delete">Delete</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </label>
                <label className="flex flex-col mb-2">
                    <span className='font-lato text-acc-4 text-[16px]'>Log Type</span>
                    <Select value={t} onValueChange={(e) => setSel(e as string, setType, 'at')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by log types"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="Buyer">Customers</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                                <SelectItem value="Good">Products</SelectItem>
                                <SelectItem value="Payment">Payments</SelectItem>
                                <SelectItem value="Order">Orders</SelectItem>
                                <SelectItem value="Group">Roles</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </label>
            </div>
        </div>
    )
}
export default Filters;