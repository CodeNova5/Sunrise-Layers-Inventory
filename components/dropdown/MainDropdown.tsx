import { useAuthStore } from "@/lib/providers/auth-store-provider";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import StaffDropdownItem from "./items/StaffDropdownItem";

type MainDropdownProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MainDropdown({ show, setShow }: MainDropdownProps) {
  const { firstName, lastName, email } = useAuthStore(s => s);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hide dropdown on outside click
  useEffect(() => {
    if (!show) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, setShow]);

  return (
    <div
      ref={dropdownRef}
      id="dropdown"
      className={
        "z-20 bg-white divide-y divide-gray-100 rounded-lg shadow w-44" +
        (show ? "" : " hidden")
      }
    >
      <div className="flex justify-end p-2">
        <button
          aria-label="Close"
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-gray-700">
          {firstName} {lastName}
        </p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
      <ul
        className="py-2 text-sm text-gray-700"
        aria-labelledby="dropdownDefaultButton"
      >
        <li>
          <a href="/inventory/settings" className="block px-4 py-2 hover:bg-gray-100">
            Settings
          </a>
        </li>
        <li>
          <a href="#actions/logout" className="block px-4 py-2 hover:bg-gray-100">
            Sign out
          </a>
        </li>
      </ul>
    </div>
  );
}