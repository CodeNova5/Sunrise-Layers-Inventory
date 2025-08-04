import { Buyer } from "@/lib/@types/buyer"
import { cn } from "@/lib/utils";

function getInitialsAvatar({ name }: Buyer) {

    const names = name.split(" ").slice(0, 2);
    if (names.length === 1) {
        return `https://ui-avatars.com/api/?background=random&name=${names[0]}`;
    }
    return `https://ui-avatars.com/api/?background=random&name=${names[0]}+${names[1]}`;
}


export default function ProfilePicture({ buyer, className = "" }: { buyer: Buyer, className?: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={getInitialsAvatar(buyer)}
            alt={buyer.name}
            className={cn("rounded-full h-10 w-10", className)}
        />
    );
}