import { DashboardProps } from '@/lib/@types/dashboard';
import { useState, useEffect, FC } from 'react';
import axios from "@/lib/axios";
import LogItem from '../logs/components/log-item';
import Log from '@/lib/@types/log';
import { Button } from "@/components/ui/button";

const Recents: FC<Partial<DashboardProps>> = ({ before, after }) => {
    const [recents, setRecents] = useState<Log[]>([]);

    const fetchData = async (before?: string, after?: string): Promise<Log[]> => {
        try {
            let query = '?l=10';
            if (before) query += `&b=${encodeURIComponent(before)}`;
            if (after) query += `&a=${encodeURIComponent(after)}`;
            if (!(before || after)) query = '';
            const response = await axios.get(`/api/logs${query}`);
            if (response.status !== 200) {
                throw response;
            }
            return response.data.logs || [];
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    useEffect(() => {
        fetchData(before, after).then((data) => {
            setRecents(data);
        });
    }, [before, after]);

    return (
        <div className="w-full h-[350px] grow rounded-md bg-inherit shadow-md overflow-y-auto flex flex-col gap-3 scrollbar-thin">
            <h3 className="w-full sticky top-0 bg-[#FFECB3] border-b-[#FFE8B0] text-lg text-center text-pri-6 font-bold pt-4 px-4">
                Recent Activity
            </h3>
        
            <ul className="px-4 flex flex-col gap-2 mb-4">
                {recents && recents.length > 0 ? (
                    recents.map((val: Log, idx) => (
                        <LogItem key={idx} {...val} preview={false} />
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div>No activity yet — let’s get things rolling!</div>
                        <span className="text-sm text-gray-500">
                            Start by adding staff or stock to your store.
                        </span>
                        <Button
                            onClick={() => {
                                const el = document.getElementById("staff-stock-setup");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="mb-2 mt-1"
                        >
                            Go to Staff and Stock Setup
                        </Button>
                    </div>
                )}
            </ul>

        </div>
    );
};

export default Recents;