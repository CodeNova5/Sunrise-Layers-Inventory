"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import Group from "@/lib/@types/group";
import { FC } from "react";
import { LoaderCircle, Minus, Plus } from "lucide-react";
import { useStaffStore } from "@/lib/providers/staff-store-provider";
interface EditUserRolesProps {
  staffId: string;
  name: string;
}
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import React from "react";
import { CgSpinner } from "react-icons/cg";
import { useQueryState } from "nuqs";
import { cachedRetrieve } from "@/lib/utils";
import Modal from "@/components/ui/modal";

export default function EditStaffRoles() {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "banning" | "loading">(
    "loading"
  );
  const [lo, setLo] = useState<string>("");
  const {
    getStaff,
    staff: staffs,
    groups,
    updateStaffGroup,
  } = useStaffStore((state) => state);
  const [staffId, setStaffId] = useQueryState("staff", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const closeModal = () => {
    setStaffId("");
    setName("");
    setStatus("loading");
  };

  const changeRole = (groupId: string, state: boolean) => {
    setLo(groupId);
    updateStaffGroup({ staffId, groupId, state }).then(() => {
      setLo("");
    });
  };

  useEffect(() => {
    if (!staffId.length) return;
    cachedRetrieve(staffs, staffId, getStaff).then((staff) => {
      setName(staff.firstName + " " + staff.lastName);
      setStatus("idle");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  return (
    <Modal
      id="actions/staff/roles"
      classNames={{ body: "flex flex-col gap-4" }}
      title="Edit Staff Roles"
      onClose={closeModal}
    >
      <div>
        <ul>
          {groups
            .filter((group) => group.members.includes(staffId))
            .map((g) => (
              <li key={g.id} className="hover:bg-neu-2 cursor-pointer mb-2 p-2">
                <h3 className="capitalize text-acc-7 font-semibold flex flex-row items-center justify-between">
                  {g.name}
                  {lo == g.id ? (
                    <LoaderCircle
                      strokeWidth={2}
                      size={20}
                      color={"#877802"}
                      className="animate-spin"
                    />
                  ) : (
                    <Minus
                      onClick={() => {
                        changeRole(g.id, false);
                      }}
                      color={"red"}
                      strokeWidth={2}
                      size={20}
                    />
                  )}
                </h3>
                <p className="text-sm">{g.description}</p>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <h3 className="text-pri-6 font-bold">Add These roles to {name}</h3>
        <ul>
          {groups
            .filter((group) => !group.members.includes(staffId))
            .map((g) => (
              <li key={g.id} className="hover:bg-neu-2 cursor-pointer mb-2 p-2">
                <h3 className="capitalize text-acc-7 font-semibold flex flex-row items-center justify-between">
                  {g.name}
                  {lo === g.id ? (
                    <LoaderCircle
                      strokeWidth={2}
                      size={20}
                      color={"#877802"}
                      className="animate-spin"
                    />
                  ) : (
                    <Plus
                      className="hover:scale(115) transition-all"
                      onClick={() => changeRole(g.id, true)}
                      color={"green"}
                      strokeWidth={2}
                      size={20}
                    />
                  )}
                </h3>
                <p className="text-sm">{g.description}</p>
              </li>
            ))}
        </ul>
      </div>
    </Modal>
  );
}
