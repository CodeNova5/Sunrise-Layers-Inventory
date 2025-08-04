"use client";
import React, { useRef, FC, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal, {
  ModalProps,
  ClassNames as BaseClassNames,
  closeModal,
} from "./modal";
import { Button } from "./button";

type ClassNames = BaseClassNames | "confirm" | "cancel";
export type DialogStatus = "idle" | "loading" | "working";

export interface DialogModalProps extends ModalProps {
  icon?: ReactNode;
  confirm?: ReactNode;
  cancel?: ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  classNames?: {
    [key in ClassNames]?: string;
  };
  status?: DialogStatus;
}


const DialogModal: FC<DialogModalProps> = ({
  id,
  title,
  children,
  classNames,
  icon,
  confirm = "Confirm",
  cancel = "Cancel",
  status,
  onClose,
  onConfirm,
  onCancel = () => {},
}) => {
  async function handleCancel() {
    await onCancel();
    closeModal(id);
    await onClose?.();
  }

  async function handleConfirm() {
    await onConfirm();
    closeModal(id);
    await onClose?.();
  }
  return (
    <Modal
      id={id}
      title={title}
      classNames={{
        ...classNames,
        body: cn(
          "flex flex-col items-center justify-center",
          classNames?.body
        ),
      }}
      onClose={onClose}
    >
      {icon}
      {children}
      <div className="flex justify-between mt-6 gap-4">
        <Button
          variant={"destructive"}
          onClick={handleConfirm}
          disabled={status && status !== "idle"}
          className={cn("modal-cancel-btn", classNames?.cancel)}
        >
          {confirm}
        </Button>
        <Button
          variant={"outline"}
          onClick={handleCancel}
          disabled={status && status !== "idle"}
          className={cn("modal-confirm-btn", classNames?.confirm)}
        >
          {cancel}
        </Button>
      </div>
    </Modal>
  );
};

export default DialogModal;
