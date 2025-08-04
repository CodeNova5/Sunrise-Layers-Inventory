"use client";
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import React, { FC } from "react";
import { toast } from "react-toastify";
import { useQueryState } from "nuqs";
import { useGoodStore } from "@/lib/providers/good-store-provider";
import DialogModal from "../ui/dialog-modal";
import { Trash, LoaderCircle } from "lucide-react";

interface DeleteGoodProps {}

const DeleteGoodModal: FC<DeleteGoodProps> = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "working">(
    "loading"
  );
  const { getGood, deleteGood } = useGoodStore((state) => state);
  const [goodId, setGoodId] = useQueryState("goodId", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const closeModal = () => {
    setGoodId("");
    setName("");
    setStatus("loading");
  };

  const handleDelete = async () => {
    setStatus("working");
    try {
      await deleteGood(goodId);
      setStatus("idle");
      toast.success(`'${name}' deleted successfully`);
      closeModal();
    } catch (error) {
      setStatus("idle");
      toast.error(`An error occurred while deleting the '${name}'`);
    }
  };

  useEffect(() => {
    if (goodId.length > 0) {
      getGood(goodId).then((good) => {
        setName(good.name);
        setStatus("idle");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goodId]);

  return (
    <DialogModal
      id="actions/product/delete"
      title="Delete Product"
      onClose={closeModal}
      icon={<Trash className="w-12 h-12 text-orange-500" />}
      onConfirm={handleDelete}
      status={status}
      confirm="Delete"
    >
      {status === "loading" ? (
        <LoaderCircle className="w-12 h-12 text-gray-200 animate-spin" />
      ) : (
        <p className="space-x-1 mt-4 text-center">
          <span>Are you sure you want to delete</span>
          <span className="font-semibold">{name}</span>
          <span>
            from the store records?
            <br />
            This action cannot be undone.
          </span>
        </p>
      )}
    </DialogModal>
  );
};

export default DeleteGoodModal;
