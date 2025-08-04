"use client";
import { useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import React from "react";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import { useStaffStore } from "@/lib/providers/staff-store-provider";
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

export default function AddNewStaffModal() {
  const modalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "creating">("idle");
  const [firstName, setFirstname] = useState<string>("");
  const [lastName, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const { createStaff } = useStaffStore((state) => state);

  const closeModal = () => {
    clearForm();
  };

  const clearForm = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setPhone("");
    setStatus("idle");
  };

  function handleCreateStaff() {
    const data: FormData = {
      firstName,
      lastName,
      email,
      phone,
    };
    if (validateForm(data)) {
      setStatus("creating");
      createStaff({
        ...data,
        password: email,
        groups: [] as string[],
      })
        .then((created) => {
          toast.success(
            <p>
              Staff{" "}
              <span className="font-medium text-pri-3">
                {firstName} {lastName}
              </span>{" "}
              added successfully
            </p>,
            {
              toastId: "staff-added",
            }
          );
          clearForm();
        })
        .catch((error) => {
          const e = toError(error)
          toast.error(error.message, { toastId: "staff-add-error" });
          setStatus("idle");
        });
    }
  }

  return (
    <Modal id="actions/staff/create" title="Add New Staff" onClose={closeModal}>
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
            onChange={(e) => setPhone(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-acc-7 focus:border-acc-7 block w-full p-2.5"
            placeholder="08012345678"
          />
        </div>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            handleCreateStaff();
          }}
          disabled={status === "creating"}
          className="w-full bg-[#FFE082] hover:bg-[#FFECB3] text-black font-bold rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
        >
          {status === "creating" ? (
            <>
              <CgSpinner className="animate-spin inline-block" />
              <span className="ml-2">Adding Staff...</span>
            </>
          ) : (
            "Add Staff"
          )}
        </button>
        <div className="text-sm font-medium text-red-400 text-center w-full">
          The Staff&apos;s Password Is The Same As Their Email
        </div>
      </form>
    </Modal>
  );
}
