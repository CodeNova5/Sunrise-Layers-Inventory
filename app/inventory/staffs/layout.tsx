import { StaffStoreProvider } from "@/lib/providers/staff-store-provider";
import AddNewStaffModal from "./components/modals/create-staff";
import BanStaffModal from "./components/modals/ban-staff";
import UnbanStaffModal from "./components/modals/unban-staff";
import EditStaffModal from "./components/modals/edit-staff";
import EditStaffRoles from "./components/modals/edit-staff-roles";

export default function OverviewLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <StaffStoreProvider>
            <AddNewStaffModal />
            <EditStaffModal />
            <BanStaffModal/>
            <UnbanStaffModal/>
            <EditStaffRoles/>
            {children}
        </StaffStoreProvider>
    );
}
