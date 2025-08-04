"use client";
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import React from "react";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import { useStaffStore } from "@/lib/providers/staff-store-provider";
import Staff from "@/lib/@types/staff";
import { useQueryState } from "nuqs";
import { cachedRetrieve } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import { toError } from "@/lib/errors";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

function validateEmail({ email }: FormData) {
  const re = /\S+@\S+\.\S+/;
  if (!email.length) {
    toast.error("Email is required", { toastId: "email-required" });
    return false;
  }
  if (!re.test(email)) {
    toast.error("Email is not valid", { toastId: "email-invalid" });
    return false;
  }
  return true;
}

function validatePhone({ phone }: FormData) {
  const re = /^\d{11}$/;
  if (!phone.length) {
    toast.error("Phone number is required", { toastId: "phone-required" });
    return false;
  }
  if (!re.test(phone)) {
    toast.error("Phone number is not valid", { toastId: "phone-invalid" });
    return false;
  }
  return true;
}

function validateName({ firstName, lastName }: FormData) {
  if (!firstName.trim()) {
    toast.error("First name is required", { toastId: "fname-required" });
    return false;
  } else if (firstName.length < 3) {
    toast.error("First name must be at least 3 characters", {
      toastId: "fname-invalid",
    });
    return false;
  }
  if (!lastName.trim()) {
    toast.error("Last name is required", { toastId: "lname-required" });
    return false;
  } else if (lastName.length < 3) {
    toast.error("Last name must be at least 3 characters", {
      toastId: "lname-invalid",
    });
    return false;
  }
  return true;
}

function validateForm(data: FormData) {
  if (!validateName(data) || !validateEmail(data) || !validatePhone(data)) {
    return false;
  }
  return true;
}

function getUpdatedFields(staff: Staff, data: FormData) {
  const updatedFields: Partial<Staff> = {};
  if (staff.firstName !== data.firstName) {
    updatedFields.firstName = data.firstName;
  }
  if (staff.lastName !== data.lastName) {
    updatedFields.lastName = data.lastName;
  }
  if (staff.email !== data.email) {
    updatedFields.email = data.email;
  }
  if (staff.phone !== data.phone) {
    updatedFields.phone = data.phone;
  }
  return Object.keys(updatedFields).length ? updatedFields : null;
}

export default function EditStaffModal() {
  const modalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "loading">(
    "loading"
  );
  const [firstName, setFirstname] = useState<string>("");
  const [lastName, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [staffId, setStaffId] = useQueryState("staff", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const {
    updateStaff,
    getStaff,
    staff: staffs,
  } = useStaffStore((state) => state);
  const staffRef = useRef<Staff | null>(null);

  const closeModal = () => {
    clearForm();
    setStaffId("");
  };

  const clearForm = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setPhone("");
    setStatus("loading");
  };

  function handleEditStaff() {
    const data: FormData = {
      firstName,
      lastName,
      email,
      phone,
    };
    const payload = getUpdatedFields(staffRef.current!, data);
    if (!payload) {
      toast.warn("No changes made", { toastId: "no-changes" });
      return;
    }
    if (validateForm(data)) {
      setStatus("saving");
      updateStaff(staffId, payload)
        .then(() => {
          toast.success("Staff updated", {
            toastId: "staff-updated",
          });
          clearForm();
        })
        .catch((error) => {
          const e = toError(error);
          toast.error(e.message, {
            toastId: "staff-update-error",
          });
          setStatus("idle");
        });
    }
  }

  useEffect(() => {
    if (!staffId.length) return;
    cachedRetrieve(staffs, staffId, getStaff)
      .then((staff) => {
        staffRef.current = staff;
        setFirstname(staff.firstName);
        setLastname(staff.lastName);
        setEmail(staff.email);
        setPhone(staff.phone);
        setStatus("idle");
      })
      .catch((error) => {
        toast.error("Could not fetch staff", {
          toastId: "staff-fetch-error",
        });
        setStatus("idle");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  return (
    <Modal
      id="actions/staff/edit"
      title="Edit Staff Details"
      onClose={closeModal}
    >
      <form className="space-y-4" action="#">
        <div>
          <label
            htmlFor="firstname"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            value={firstName}
            disabled={status !== "idle"}
            onChange={(e) => setFirstname(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-acc-7 focus:border-acc-7 block w-full p-2.5"
            placeholder="John"
            required
          />
        </div>
        <div>
          <label
            htmlFor="lastname"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            value={lastName}
            disabled={status !== "idle"}
            onChange={(e) => setLastname(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-acc-7 focus:border-acc-7 block w-full p-2.5"
            placeholder="Doe"
            required
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            disabled={status !== "idle"}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-acc-7 focus:border-acc-7 block w-full p-2.5"
            placeholder="name@company.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={phone}
            disabled={status !== "idle"}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-acc-7 focus:border-acc-7 block w-full p-2.5"
            placeholder="08012345678"
          />
        </div>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            handleEditStaff();
          }}
          disabled={status !== "idle"}
          className="w-full text-white bg-pri-6 hover:bg-pri-4 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          {status === "saving" ? (
            <>
              <CgSpinner className="animate-spin inline-block" />
              <span className="ml-2">Saving Updates</span>
            </>
          ) : (
            "Save"
          )}
        </button>
        <div className="text-sm font-medium text-orange-400 text-center w-full">
          The Staff&apos;s Password Would Not Be Changed
        </div>
      </form>
    </Modal>
  );
}
