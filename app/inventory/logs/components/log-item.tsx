import { Fingerprint, UsersRound, Package, ReceiptText, ChevronRight, ChevronDown, ShoppingCart } from "lucide-react"
import React, { FC, useState } from "react"
import Link from 'next/link'
import { formatDateTime, formatInvoiceNumber } from '@/lib/utils';
import Log from '@/lib/@types/log'
import ContactAvatar from '@/components/ui/contact-avatar'
import DetailsTable from './details-table'
const customMessages: any = {
    Buyer: {
        create: [
            " landed a new buyer: ",
            " added a new client: ",
            " registered a new buyer: "
        ],
        update: [
            " updated the details of ",
            " modified the profile of ",
            " changed the information of "
        ],
        delete: [
            " removed the buyer: ",
            " deleted the client: ",
            " erased the profile of "
        ]
    },
    Staff: {
        create: [
            " added a new staff member: ",
            " registered a new employee: ",
            " onboarded a new team member: "
        ],
        update: {
            banned: [
                " banned the staff member: ",
                " terminated the employee: ",
                " deleted the profile of "
            ],
            unbanned: [
                " unbanned the staff member: ",
                " reinstated the employee: ",
                " restored the profile of "
            ],
            updated: [
                " updated the details of ",
                " modified the profile of ",
                " changed the information of "
            ],
        },
        delete: [
            " removed the staff member: ",
            " terminated the employee: ",
            " deleted the profile of "
        ]
    },
    Good: {
        create: [
            " added a new good: ",
            " introduced a new product: ",
            " listed a new item: "
        ],
        update: [
            " updated the inventory for ",
            " modified the details of ",
            " changed the information of "
        ],
        delete: [
            " removed the good: ",
            " deleted the product: ",
            " erased the item: "
        ]
    },
    Group: {
        create: [
            " created a new group: ",
            " formed a new team: ",
            " established a new unit: "
        ],
        update: {
            updated: [
                " updated the group details for ",
                " modified the information of ",
                " changed the details of "
            ],
            added: [
                " added a new member to the group: ",
                " added a new role to the member"
            ],
            removed: [
                " removed a member from the group: ",
                " removed a role from the member: "
            ]

        },
        delete: [
            " deleted the group: ",
            " removed the role: "
        ]
    },
    Order: {
        create: [
            " placed order ",
            " initiated a purchase for order ",
        ],
        update: [
            " updated order ",
            " modified order ",
            " changed order "
        ],
        delete: [
            " canceled order ",
            " voided order ",
            " deleted order "
        ]
    },
    Payment: {
        create: [
            " placed a new payment for order ",
            " paid another installment for order "
        ],
    },
    Invoice: {
        create: [
            " generated invoice ",
            " created invoice ",
            " issued invoice "
        ],
        update: [
            " updated invoice ",
            " modified invoice ",
            " changed invoice "
        ],
        delete: [
            " deleted invoice ",
            " voided invoice ",
            " removed invoice "
        ]
    }
}

const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
}
const parseLog = (log: LogProps) => {
    const data: any = {}
    if (["Group", 'Staff'].includes(log.target) && log.action == "update") {
        data.message = getRandomMessage(customMessages[log.target][log.action][log.details['action_type']])
    } else
        data.message = getRandomMessage(customMessages[log.target][log.action])
    data.display = log.display
    data.createdAt = log.createdAt
    data.target = log.target
    data.action = log.action
    data.preview = log.preview
    if (log.details) {
        const { action_type, ...details } = log.details
        data.details = details
        data.action_type = action_type
    }
    switch (log.target) {
        case 'Buyer': {
            data.avatar = { name: log.display[1] }
            data.link = `/inventory/buyers/${log.targetId}`
            break
        }
        case 'Staff': {
            data.avatar = { icon: UsersRound }
            data.link = `/inventory/staffs/${log.targetId}`
            break
        }
        case 'Good': {
            data.avatar = { icon: Package }
            data.link = `/inventory/products/${log.targetId}`
            break
        }
        case 'Group': {
            data.avatar = { icon: Fingerprint }
            data.link = `/inventory/roles/${log.targetId}`
            break
        }
        case 'Order': {
            data.avatar = { icon: ShoppingCart }
            data.link = `/inventory/orders/${log.targetId}`
            data.display = [log.display[0], formatInvoiceNumber(log.display[1])]
            break
        }
        case 'Payment': {
            data.avatar = { name: log.display[0] }
            data.link = `/inventory/orders/${log.targetId}`
            data.display = [log.display[0], formatInvoiceNumber(log.display[1])]
            break
        }
        case "Invoice": {
            data.avatar = { icon: ReceiptText }
            data.link = `/inventory/invoices/${log.targetId}`
            data.display = [log.display[0], formatInvoiceNumber(log.display[1])]
            break
        }
    }
    return data
}
interface LogProps extends Log {
    preview: boolean;
}


const LogItem: FC<LogProps> = (log) => {
    const [item, setItem] = useState(parseLog(log))
    const [showMore, setSM] = useState(false)
    return (
        <div className="flex flex-row gap-2 font-lato">
            <div className='flex flex-col items-center justify-start gap-2'>
                <ContactAvatar {...item.avatar} size={40} />
                <span className="w-[3px] grow bg-acc-6 rounded-md "></span>
            </div>
            <div className="border-neu-3 p-3 py-2">
                <h3 className="text-neu-7 text-sm">{formatDateTime(item.createdAt, "time")}</h3>
                <div className="flex flex-row gap-2">
                    {
                        item.preview && <>
                            <span className="px-1 font-rambla text-[12px] text-pri-3 border border-pri-3 lowercase">{item.action}</span>
                            <span className="px-1 font-rambla text-[12px] text-pri-3 border border-pri-3 lowercase">{item.target}</span>
                            {item.action_type && <span className="px-1 font-rambla text-[12px] text-pri-3 border border-pri-3 lowercase">{item.action_type}</span>}
                        </>
                    }
                </div>
                <p><span className="text-pri-6 font-normal">{item.display[0]}</span>{item.message}
                    {item.action == "delete" ?
                        <span className="text-pri-6 font-semibold">{item.display[1]}</span>
                        : <Link href={item.link}>
                            <span className="text-pri-6 font-semibold">{item.display[1]}</span>
                        </Link>}
                </p>
                {
                    item.details && item.preview &&
                    <>
                        <p className="text-[14px] cursor-pointer transition-scale mt-3 active:scale-99 text-neu-7 flex flex-row items-center justify-start gap-2" onClick={() => setSM(!showMore)}>
                            Details

                            {showMore ? <ChevronDown strokeWidth={2} size={15} /> : <ChevronRight strokeWidth={2} size={15} />}
                        </p>
                        {showMore && item.details &&
                            <DetailsTable details={item.details} />
                        }
                    </>

                }
                <p className='text-sm text-neu-5'>{formatDateTime(log.createdAt, "humanize")}</p>
            </div>
        </div>
    )
}

export default LogItem