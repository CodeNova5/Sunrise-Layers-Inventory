"use client";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { toast } from "react-toastify";
import { useQueryState } from "nuqs";
import { useStaffStore } from "@/lib/providers/staff-store-provider";
import { cachedRetrieve } from "@/lib/utils";
import { LoaderCircle, UserPlus } from "lucide-react";
import DialogModal from "@/components/ui/dialog-modal";

export default function UnbanStaffModal() {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "working" | "loading">(
    "loading"
  );
  const {
    getStaff,
    unbanStaff,
    staff: staffs,
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

  const handleUnban = async () => {
    setStatus("working");
    try {
      await unbanStaff(staffId);
      setStatus("idle");
      toast.info(`'${name}' has been unbanned`);
    }
    catch (err) {
      setStatus("idle");
      toast.error(`Failed to unban ${name}.`);
    }
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
    <DialogModal
      id="actions/staff/unban"
      title="Unban Staff"
      onClose={closeModal}
      icon={<UserPlus className="w-12 h-12 text-green-500" />}
      confirm={status === "working" ? "Unbanning" : "Unban"}
      onConfirm={handleUnban}
      status={status}
    >
      {status === "loading" ? (
        <LoaderCircle className="w-12 h-12 animate-spin" />
      ) : (
        <p className="text-center mt-4">
          Are you sure you want to give{" "}
          <span className="font-semibold">{name}</span>
          {" "} access to the system?
        </p>
      )}
    </DialogModal>
  );
}
