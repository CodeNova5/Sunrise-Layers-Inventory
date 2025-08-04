"use client";
import React, { createContext } from "react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/providers/auth-store-provider";
import MainDropdown from "../../components/dropdown/MainDropdown";
import AddNewStaffModal from "./staffs/components/modals/create-staff";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Package,
  ReceiptText,
  CircleDollarSign,
  Users,
  Scroll,
  Fingerprint,
  CircleUser,
  LayoutDashboard,
  Lock,
  ShoppingCart,
} from "lucide-react";
import InventoryProviders from "./providers";
import AddGoodModal from "@/components/modals/AddGoodModal";
import AddNewBuyerModal from "./buyers/components/modals/create-buyer";
import Image from "next/image";
import { companyName } from "@/data";
import { Button } from "@/components/ui/button";
import LogoutModal from "@/components/modals/LogoutModal";
import Link from "next/link";
import { ability, Ability, Actions, Subjects } from "@/lib/permissions/ability";
import { useAbility } from "@/lib/hooks/ability";
import { createContextualCan } from "@casl/react"

interface SectionItem {
  icon: React.ReactNode;
  content: React.ReactNode | string;
  link: string;
  getIsActive: (pathname: string) => boolean;
  ability: {
    action: Actions;
    subject: Subjects;
  };
}

interface Section {
  name: string;
  content?: React.ReactNode;
  items: SectionItem[];
  show: boolean;
  ability?: {
    action: Actions;
    subject: Subjects;
  };
}

const sections: Section[] = [
  {
    name: "Inventory",
    show: true,
    items: [
      {
        icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
        content: "Dashboard",
        getIsActive: (pathname) =>
          pathname === "/inventory" || pathname === "/inventory/",
        link: "/inventory",
        ability: {
          action: "read",
          subject: "dashboard",
        },
      },
      {
        icon: <Package size={20} strokeWidth={1.5} />,
        content: "Store",
        getIsActive: (pathname) => pathname.startsWith("/inventory/products"),
        link: "/inventory/products",
        ability: {
          action: "read",
          subject: "product",
        },
      },
      {
        icon: <ReceiptText size={20} strokeWidth={1.5} />,
        content: "Quick Receipts",
        getIsActive: (pathname) => pathname.startsWith("/inventory/quick-receipts"),
        link: "/inventory/quick-receipts",
        ability: {
          action: "read",
          subject: "order",
        },
      },
      {
        icon: <ShoppingCart size={20} strokeWidth={1.5} />,
        content: "Orders",
        getIsActive: (pathname) => pathname.startsWith("/inventory/orders"),
        link: "/inventory/orders",
        ability: {
          action: "read",
          subject: "order",
        },
      },
      {
        icon: <CircleDollarSign size={20} strokeWidth={1.5} />,
        content: "Invoices",
        getIsActive: (pathname) => pathname.startsWith("/inventory/invoices"),
        link: "/inventory/invoices",
        ability: {
          action: "read",
          subject: "order",
        },
      },
      {
        icon: <CircleDollarSign size={20} strokeWidth={1.5} />,
        content: "Payments",
        getIsActive: (pathname) => pathname.startsWith("/inventory/payments"),
        link: "/inventory/payments",
        ability: {
          action: "read",
          subject: "payment",
        },
      },
      {
        icon: <Users size={20} strokeWidth={1.5} />,
        content: "Customers",
        getIsActive: (pathname) => pathname.startsWith("/inventory/buyers"),
        link: "/inventory/buyers",
        ability: {
          action: "read",
          subject: "customer",
        },
      },
    ],
  },
  {
    name: "Access Control",
    show: true,
    items: [
      {
        icon: <CircleUser size={20} strokeWidth={1.5} />,
        content: "Manage Staff",
        getIsActive: (pathname) => pathname.startsWith("/inventory/staffs"),
        link: "/inventory/staffs",
        ability: {
          action: "read",
          subject: "user",
        },
      },
      {
        icon: <Fingerprint size={20} strokeWidth={1.5} />,
        content: "Manage Roles",
        getIsActive: (pathname) => pathname.startsWith("/inventory/roles"),
        link: "/inventory/roles",
        ability: {
          action: "read",
          subject: "permission",
        },
      },
      {
        icon: <Scroll size={20} strokeWidth={1.5} />,
        content: "Activity Logs",
        getIsActive: (pathname) => pathname.startsWith("/inventory/logs"),
        link: "/inventory/logs",
        ability: {
          action: "read",
          subject: "log",
        },
      },
    ],
  },
];

const AbilityContext = createContext<Ability>(ability);
export const Can = createContextualCan(AbilityContext.Consumer);


export default function Inventory({
  children,
}: {
  children: React.ReactNode;
}) {
  // Change default to false so navbar is hidden by default
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { email } = useAuthStore((state) => state);
  const [showSections, setShowSections] = useState<{
    [key: string]: boolean;
  }>({});
  const pathname = usePathname();
  const ability = useAbility();
  function toggleSection(section: string, defaultValue = true) {
    setShowSections((prev) => ({
      ...prev,
      [section]: !(prev[section] === undefined ? defaultValue : prev[section]),
    }));
  }

  function canShowSection(section: string, defaultValue = true): boolean {
    return showSections[section] === undefined
      ? defaultValue
      : showSections[section];
  }

  const handleCloseMenu = () => {
    setShowMenu(window.innerWidth > 768);
  }

  useEffect(() => {
    // Remove auto-show on mount, keep resize handler only
    function handleResize() {
      setShowMenu(window.innerWidth > 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <AbilityContext.Provider value={ability}>
      <LogoutModal />
      <div className="fixed w-full bg-[#FFF8E1] flex flex-row items-center justify-start top-0 right-0">
        <nav
          className={`fixed top-0 left-0 h-screen bg-[#FFE8B0] w-[220px] z-50 transition-transform duration-300 ease-in-out transform ${showMenu ? "translate-x-0" : "-translate-x-full"} shadow-lg border-r border-[#FFD965] text-[#5A4E36] font-quicksand`}
        >
          <div className="header pt-4 text-center border-b border-[#FFD965] pb-4 mb-2">
            <Image
              className="mx-auto"
              src="/logo.png"
              width={50}
              height={50}
              alt="logo"
            />
            <h1 className="text-xl font-lg pb-1">{companyName}</h1>
          </div>

          {showMenu ? (
            <X
              size={28}
              strokeWidth={1.5}
              onClick={() => setShowMenu((prev) => !prev)}
              className="absolute top-[20px] right-[-40px] cursor-pointer text-black transition active:scale-95 duration-200 ease-in z-30"
            />
          ) : (
            <Menu
              strokeWidth={1.5}
              size={28}
              onClick={() => setShowMenu((prev) => !prev)}
              className="absolute top-[20px] right-[-40px] cursor-pointer text-black transition active:scale-95 duration-200 ease-in z-30"
            />
          )}

          <div className="flex flex-col gap-2 px-2 py-4 pb-10">
            {sections.map((section) => (
              <div key={section.name} className="mb-2">
                <button
                  onClick={() => toggleSection(section.name, section.show)}
                  className="w-full flex flex-row items-center justify-between px-3 py-2 rounded-md bg-[#FFFBF0] hover:bg-[#FFD965] text-[#8B7B52] font-semibold transition"
                >
                  <span>{section.content || section.name}</span>
                  {canShowSection(section.name, section.show) ? (
                    <ChevronDown strokeWidth={1.5} size={18} />
                  ) : (
                    <ChevronRight strokeWidth={1.5} size={18} />
                  )}
                </button>
                {canShowSection(section.name, section.show) && (
                  <ul className="flex flex-col gap-1 mt-1 pl-2">
                    {section.items.map((item, idx) => (
                      <Can key={idx} do={item.ability.action} on={item.ability.subject} passThrough>
                        {allowed =>
                          allowed ? (
                            <Link
                              href={item.link}
                              onClick={handleCloseMenu}
                              className={`flex flex-row items-center gap-2 px-3 py-2 rounded-md text-[15px] hover:bg-[#FFE8B0] hover:text-[#5A4E36] transition ${item.getIsActive(pathname) ? "bg-[#FFF9C4] font-semibold" : "text-[#5A4E36]"}`}
                            >
                              {item.icon}
                              {item.content}
                            </Link>
                          ) : (
                            <span
                              className="flex flex-row items-center gap-2 px-3 py-2 rounded-md text-[15px] text-[#BCA77B] cursor-not-allowed opacity-60"
                            >
                              <Lock size={18} strokeWidth={1.5} />
                              {item.content}
                            </span>
                          )
                        }
                      </Can>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </nav>
        <main
          className={`relative w-full h-screen pt-[60px] overflow-y-auto font-lato`}
        >

          {showMenu && (
            <div
              className="fixed inset-0 bg-[#5A4E36]/40 backdrop-blur-sm z-40"
              onClick={() => setShowMenu(false)}
            />

          )}

          <header
            className={`fixed top-0 right-0 w-screen h-[60px] ${showMenu ? "md:w-[calc(100vw-220px)]" : "md:w-screen"} border-b border-[#FFD965] bg-[#FFE8B0] overflow-visible z-30 transition-all duration-200 ease-in`}
          >
            <h1 className="text-center text-lg font-semibold text-[#5A4E36] pt-2">
              {companyName} Inventory
            </h1>

            <div className="relative">
              <div className="absolute right-[10px] top-[-30px] overflow-visible flex flex-col items-end justify-start">
                <Button
                  variant={"ghost"}
                  className="inline-flex items-center p-2 gap-3 capitalize font-medium text-center text-[#5A4E36] bg-[#FFFBF0] rounded-lg hover:bg-[#FFD965] focus:ring-4 focus:outline-none focus:ring-[#FFE8B0]"
                  type="button"
                  id="dropdownToggle"
                  onClick={() => setShowDropdown((show) => !show)}
                >
                  <Image
                    src="/profile.jpg"
                    width={30}
                    height={30}
                    alt="avatar"
                    className="rounded-full"
                  />
                </Button>
                <MainDropdown show={showDropdown} setShow={setShowDropdown} />
              </div>
            </div>
          </header>
          <AddGoodModal />
          <AddNewStaffModal />
          <AddNewBuyerModal />
          {children}
        </main>
      </div>
    </AbilityContext.Provider>
  );
}
