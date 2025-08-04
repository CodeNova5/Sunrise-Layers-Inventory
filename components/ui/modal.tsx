"use client";
import React, { useRef, FC } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ClassNames =
  | "modal"
  | "content"
  | "header"
  | "title"
  | "close"
  | "body";

export interface ModalProps {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  classNames?: {
    [key in ClassNames]?: string;
  };
  onClose?: () => void | Promise<void>;
}

/**
 * close the modal with the given id
 */
export function closeModal(id: string) {
  // Always clear the hash, regardless of its value
  window.location.hash = "";
  return true;
}

const classList: ModalProps["classNames"] = {
  modal: `
    fixed inset-0 z-50 overflow-y-auto overflow-x-hidden
    flex items-center justify-center
    bg-black/50 backdrop-blur-sm
    transition-all duration-300 ease-in-out
    -translate-y-full target:translate-y-0
    `,
  content: `
    relative w-fit max-w-lg
    bg-[#FFF8E1] shadow-lg rounded-lg
    p-4 md:p-6
    transform scale-95
    transition-all duration-300 ease-in-out
    target:scale-100
    border border-[#FFE082]
    `,
  header: `
    flex items-center justify-between
    px-4 md:px-6
    rounded-t-lg
    `,
  close: `
    absolute end-4 top-4
    cursor-pointer
    flex justify-center items-center
    p-0 m-0 w-8 h-8
    border-0
    text-[#B28704] hover:text-[#FFD54F]
    bg-transparent
    `,
  title: `
    text-xl font-semibold text-[#B28704]
    `,
  body: `
    p-4 md:p-6
    bg-[#FFFDE7]
    rounded-b-lg
    `,
};

const Modal: FC<ModalProps> = ({
  id,
  title,
  children,
  classNames,
  onClose,
}) => {
  const contentArea = useRef<HTMLDivElement>(null);
  const closeModalInternal = async () => {
    closeModal(id);
    await onClose?.();
  };

  const handleClickedOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      contentArea.current &&
      !contentArea.current.contains(e.target as Node)
    ) {
      closeModalInternal();
    }
  };

  return (
    <div
      className={cn("modal", classList.modal, classNames?.modal)}
      id={id}
      tabIndex={-1}
      onClick={handleClickedOutside}
    >
      <div
        className={cn("modal-content", classList.content, classNames?.content)}
        ref={contentArea}
      >
        <div
          className={cn("modal-header", classList.header, classNames?.header)}
        >
          <h2 className={cn("modal-title", classList.title, classNames?.title)}>
            {title}
          </h2>
          <button
            className={cn("modal-close", classList.close, classNames?.close)}
            onClick={e => {
              e.stopPropagation();
              closeModalInternal();
            }}
          >
            <X size={24} />
          </button>
        </div>
        <div className={cn("modal-body", classList.body, classNames?.body)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
