"use client";
import { CircleAlert } from "lucide-react";
import Modal from "../ui/modal";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/providers/auth-store-provider";
import DialogModal from "../ui/dialog-modal";
import { useState } from "react";
import { toast } from "react-toastify";

const LogoutModal = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {clearAuth} = useAuthStore((state) => state);
  const [status, setStatus] = useState<"idle" | "working">("idle");
  const handleLogout = async () => {
    setStatus("working");
    await clearAuth();
    setStatus("idle");
    toast.info("You have been logged out");
    router.push(`/auth/login?redirect=${pathname}`);
  };
  return (
    <DialogModal
      id="actions/logout"
      title=""
      icon={<CircleAlert className="w-12 h-12 text-acc-3" />}
      cancel="Cancel"
      confirm="Logout"
      onConfirm={handleLogout}
      status={status}
    >
      <div className="text-lg font-bold mt-4">Logout</div>
      <div className="text-sm text-gray-500 mt-2">
        Are you sure you want to logout?
      </div>
    </DialogModal>
  );
};

export default LogoutModal;
