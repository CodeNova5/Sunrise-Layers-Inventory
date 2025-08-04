import { ElementType } from 'react';

interface QuickActionProps {
    front: string;
    icon: ElementType;
}

const QuickAction = ({ front, icon: Icon }: QuickActionProps) => {
    return (
        <div className="m-2">
            <div className="relative w-[250px] h-48 bg-transparent transform transition-transform duration-700 ease-in-out">
                <div className="rounded-md shadow-box font-quicksand font-semibold text-lg shadow-inset flex-col gap-3 text-center text-rambla text-white w-full h-full bg-pri-5 flex justify-center items-center p-2 active:scale-95 transition-all transition-200 cursor-pointer">
                    <Icon strokeWidth={2} size={32}/>
                    {front}
                </div>
            </div>
        </div>
    );
};

export default QuickAction