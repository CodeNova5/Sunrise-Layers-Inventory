"use client";
import { MoreHorizontal, Pencil, Ban, Fingerprint, UserRoundCheck, UserRoundX } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useQueryState } from "nuqs";
import Staff from "@/lib/@types/staff";

type ActionLinkProps = {
	href: string;
	children: React.ReactNode;
	disabled?: boolean;
	onClick?: () => void;
};

function ActionLink({ href, children, disabled, onClick }: ActionLinkProps) {
	return (
		<a
			href={href}
			className={`px-4 py-2 hover:bg-gray-100 flex flex-row justify-start items-center gap-2 ${disabled ? "cursor-not-allowed text-gray-500" : ""}`}
			onClick={(e) => {
				if (disabled) {
					e.preventDefault();
					return;
				}
				if (onClick) {
					onClick();
				}
			}}
		>
			{children}
		</a>
	);
}

export default function StaffActions({ id, status }: Staff) {
  const [_, setStaffId] = useQueryState("staff", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const handleTrigger = () => setStaffId(id);
  return (
    <Popover>
      <PopoverTrigger>
        <MoreHorizontal size={20} strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent className="w-[120px] px-0 flex flex-col gap-3">
        <ActionLink
          href="#actions/staff/edit"
          onClick={handleTrigger}
					disabled={status === "banned"}
        >
          <Pencil size={14} strokeWidth={1.5} />
          Edit
        </ActionLink>
        <ActionLink
          href={`#actions/staff/roles`}
					onClick={handleTrigger}
					disabled={status === "banned"}
        >
          <Fingerprint size={14} color="blue" strokeWidth={1.5} />
          Roles
        </ActionLink>
				{
					status === "banned" ? (
						<ActionLink
							href={`#actions/staff/unban`}
							onClick={handleTrigger}
						>
							<UserRoundCheck size={14} color="green" strokeWidth={1.5} />
							Unban
						</ActionLink>
					) : (
						<ActionLink
							href={`#actions/staff/ban`}
							onClick={handleTrigger}
						>
							<UserRoundX size={14} color="red" strokeWidth={1.5} />
							Ban
						</ActionLink>
					)
				}
      </PopoverContent>
    </Popover>
  );
}
