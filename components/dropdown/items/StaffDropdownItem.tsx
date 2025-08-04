import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const StaffDropdownItem = () => {
  const [show, setShow] = useState(false);

  return (
    <li>
      <div
        onClick={() => setShow((show) => !show)}
        className="px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
      >
        <span>Staffs</span>
        {show ? (
          <ChevronDown className="inline-block" />
        ) : (
          <ChevronRight strokeWidth={1.5} size={18}/>
        )}
      </div>
      <div
        className={
          "z-10 bg-white divide-y divide-gray-100" + (show ? "" : " hidden")
        }
      >
        <ul className="py-2 pl-2 text-sm text-gray-700">
          <li>
            <a href="/inventory/staffs" className="block px-4 py-2 hover:bg-gray-100 ">
              Manage Staffs
            </a>
          </li>
          <li>
            <a
              href="#actions/staff/add-new-staff"
              className="block px-4 py-2 hover:bg-gray-100"
            >
              Add New Staff
            </a>
          </li>
        </ul>
      </div>
    </li>
  );
};

export default StaffDropdownItem;
