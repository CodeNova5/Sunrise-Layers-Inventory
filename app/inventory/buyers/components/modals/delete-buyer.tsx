"use client";
import { useEffect, useRef, useState } from "react";
import React, { FC } from "react";
import { toast } from "react-toastify";
import { useQueryState } from "nuqs";
import { useBuyerStore } from "@/lib/providers/buyer-provider";
import { LoaderCircle, Trash } from "lucide-react";
import DialogModal from "@/components/ui/dialog-modal";

interface DeleteBuyerProps {}

const DeleteBuyerModal: FC<DeleteBuyerProps> = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "working" | "loading">(
    "loading"
  );
  const { getBuyer, deleteBuyer } = useBuyerStore((state) => state);
  const [buyerId, setBuyerId] = useQueryState("buyer", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const closeModal = () => {
    setBuyerId("");
    setName("");
    setStatus("loading");
  };

  const handleDelete = async () => {
    setStatus("working");
    try {
      await deleteBuyer(buyerId);
      setStatus("idle");
      toast.success(`${name} has been removed successfully.`);
    } catch (error) {
      setStatus("idle");
      toast.error(`Could not remove ${name}. Please try again.`);
    }
  };

  useEffect(() => {
    if (buyerId.length > 0) {
      getBuyer(buyerId).then((buyer) => {
        setName(buyer.name);
        setStatus("idle");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerId]);

  return (
    <DialogModal
      id="actions/buyer/delete"
      title="Delete Customer"
      onClose={closeModal}
      icon={<Trash className="w-12 h-12 text-orange-500" />}
      status={status}
      confirm="Delete"
      onConfirm={handleDelete}
    >
      {status === "loading" ? (
        <LoaderCircle className="w-12 h-12 text-gray-200 animate-spin" />
      ) : (
        <p className="space-x-1 mt-4 text-center">
          <span>Are you sure you want to remove</span>
          <span className="font-semibold">{name}</span>
          <span>
            from your customer list?
            <br />
            This action cannot be undone.
          </span>
        </p>
      )}
    </DialogModal>
  );
};

export default DeleteBuyerModal;
