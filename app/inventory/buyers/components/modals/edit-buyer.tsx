import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import React from "react";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import { useBuyerStore } from "@/lib/providers/buyer-provider";
import { Buyer } from "@/lib/@types/buyer";
import { useQueryState } from "nuqs";
import Modal from "@/components/ui/modal";

type FormData = {
  name: string;
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

function validateName({ name }: FormData) {
  if (!name.trim()) {
    toast.error("Name is required", { toastId: "name-required" });
    return false;
  } else if (name.length < 5) {
    toast.error("Name must be at least 5 characters", {
      toastId: "name-invalid",
    });
    return false;
  }
}

function validateForm(data: FormData) {
  if (!validateName(data) || !validateEmail(data) || !validatePhone(data)) {
    return false;
  }
  return true;
}

function getUpdatedFields(
  buyer: Buyer,
  data: FormData
): Partial<FormData> | null {
  const fields: Partial<Buyer> = {};
  if (data.name && data.name !== buyer.name) {
    fields.name = data.name;
  }
  if (data.email && data.email !== buyer.email) {
    fields.email = data.email;
  }
  if (data.phone && data.phone !== buyer.phone) {
    fields.phone = data.phone;
  }
  return Object.keys(fields).length ? fields : null;
}

export default function EditBuyerModal() {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [buyerId, setBuyerId] = useQueryState("buyer", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const { getBuyer, updateBuyer } = useBuyerStore((state) => state);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const buyer = useRef<Buyer | null>(null);

  const closeModal = () => {
    setBuyerId("");
    clearForm();
  };

  const clearForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setStatus("idle");
  };

  function handleEditStaff() {
    const data: FormData = {
      name,
      email,
      phone,
    };
    const payload = getUpdatedFields(buyer.current as Buyer, data);
    if (!payload) {
      toast.info("No changes made", { toastId: "no-changes" });
      return;
    }
    if (validateForm(data)) {
      setStatus("saving");
      updateBuyer(buyer.current!.id, data)
        .then(clearForm)
        .catch(() => {
          setStatus("idle");
          toast.error("Could not update customer. Please try again.");
        });
    }
  }

  useEffect(() => {
    if (buyerId.length) {
      getBuyer(buyerId)
        .then((data) => {
          buyer.current = data;
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone);
        })
        .catch(() => {
          toast.error("Could not fetch customer details.");
          closeModal();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerId]);

  return (
    <Modal id="actions/buyer/edit" title="Edit Customer" onClose={closeModal}>
      <form className="space-y-4" action="#">
        <div>
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Customer&lsquo;s Name
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-acc-7 focus:border-acc-7 block w-full p-2.5"
            placeholder="John Doe"
            required
            disabled
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Customer&lsquo;s Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-acc-7 focus:border-acc-7 block w-full p-2.5"
            placeholder="johndoe@example.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Customer&lsquo;s Phone Number
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
            handleEditStaff();
          }}
          disabled={status === "saving"}
          className="w-full text-white bg-pri-6 hover:bg-pri-4 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          {status === "saving" ? (
            <>
              <CgSpinner className="animate-spin inline-block" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </Modal>
  );
}
