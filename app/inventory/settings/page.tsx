"use client";
import { useEffect, useState } from "react";
import React from "react";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import Select from "react-select";
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/providers/auth-store-provider";
import { AuthState } from "@/lib/stores/auth-store";
import { User } from "@/lib/@types/user";
import { toError } from "@/lib/errors";

type Payload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

function validateEmail(email: string) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function validatePhone(phone: string) {
  const re = /^\d{11}$/;
  return re.test(phone);
}

function validateName(name: string) {
  return name.length > 0;
}

function getUpdatedFields(
  state: AuthState,
  payload: Payload
): Partial<Payload> | undefined {
  const updatedFields: Partial<Payload> = {};
  if (state.firstName !== payload.firstName) {
    updatedFields.firstName = payload.firstName;
  }
  if (state.lastName !== payload.lastName) {
    updatedFields.lastName = payload.lastName;
  }
  if (state.email !== payload.email) {
    updatedFields.email = payload.email;
  }
  if (state.phone !== payload.phone) {
    updatedFields.phone = payload.phone;
  }
  if (payload.password.length > 0) {
    updatedFields.password = payload.password;
  }
  return Object.keys(updatedFields).length > 0 ? updatedFields : undefined;
}

function validateForm({
  firstName,
  lastName,
  email,
  phone,
  password,
  confirmPassword,
}: Payload & {
  confirmPassword: string;
}) {
  if (!firstName.trim()) {
    toast.error("First name is required", { toastId: "fname-required" });
    return false;
  } else if (!validateName(firstName)) {
    toast.error("First name is not valid", { toastId: "fname-invalid" });
    return false;
  }
  if (!lastName.trim()) {
    toast.error("Last name is required", { toastId: "lname-required" });
    return false;
  } else if (!validateName(lastName)) {
    toast.error("Last name is not valid", { toastId: "lname-invalid" });
    return false;
  }
  if (!email.trim()) {
    toast.error("Email is required", { toastId: "email-required" });
    return false;
  } else if (!validateEmail(email)) {
    toast.error("Email is not valid", { toastId: "email-invalid" });
    return false;
  }
  if (!phone.trim()) {
    toast.error("Phone number is required", { toastId: "phone-required" });
    return false;
  } else if (!validatePhone(phone)) {
    toast.error("Phone number is not valid", { toastId: "phone-invalid" });
    return false;
  }
  if (password.length > 0 && password !== confirmPassword) {
    toast.error("Passwords do not match", { toastId: "password-mismatch" });
    return false;
  }
  if (password.length > 0 && password.length < 8) {
    toast.error("Password must be at least 8 characters long", {
      toastId: "password-length",
    });
    return false;
  }
  return true;
}

export default function Settings() {
  const user = useAuthStore((state) => state);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<
    readonly { label: string; value: string }[]
  >([]);
  const [groups, setGroups] = useState<
    readonly { label: string; value: string }[]
  >([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload: Payload = {
      firstName: firstname,
      lastName: lastname,
      email,
      phone,
      password,
    };
    if (!validateForm({ ...payload, confirmPassword })) {
      return;
    }
    const updatedFields = getUpdatedFields(user, payload);
    if (!updatedFields) {
      toast.info("No changes detected");
      return;
    }
    setStatus("loading");
    try {
      const response = await axios.post("/api/auth/me", updatedFields);
      if (response.status !== 200) {
        throw response;
      }
      const updatedUser: User = response.data;
      user.setAuth({ ...updatedUser, loggedIn: true });
      toast.success("Profile updated successfully");
    } catch (error) {
      const e = toError(error);
      toast.error(e.message, { toastId: "update-failed" });
    } finally {
      setStatus("idle");
    }
  }

  useEffect(() => {
    if (user.loggedIn) {
      setFirstname(user.firstName);
      setLastname(user.lastName);
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setSelectedGroups(
        user.groups.map((group) => ({
          label: group.name,
          value: group.id,
        }))
      );
    }
  }, [user]);

  return (
    <div className="relative bg-white py-[30px] px-[30px] w-full h-full overflow-auto">
      <div className="flex items-center justify-between p-4 border-b rounded-t">
        <h3 className="text-xl font-semibold text-gray-900">
          Profile Settings
        </h3>
      </div>
      <div className="p-4 md:p-5 flex flex-col gap-4">
        <form className="space-y-4 w-full" method="post" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-x-8 gap-y-4">
            <div>
              <label
                htmlFor="firstname"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                First Name
              </label>
              <Input
                disabled={!user.loggedIn}
                type="text"
                name="firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
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
              <Input
                disabled={!user.loggedIn}
                type="text"
                name="lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-x-8 gap-y-4">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Email
              </label>
              <Input
                disabled={!user.loggedIn}
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <Input
                disabled={!user.loggedIn}
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Groups
            </label>
            <Select
              isMulti
              isDisabled
              options={groups}
              value={selectedGroups}
              onChange={setSelectedGroups}
              className="w-full"
            />
          </div>
          <h3 className="flex flex-row items-center justify-start gap-6 font-quicksand font-semibold text-pri-6 !mt-8">
            Security
          </h3>
          <div className="flex flex-col md:flex-row gap-x-8 gap-y-4">
            <div>
              <label
                htmlFor="pwd"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                New Password
              </label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                name="pwd"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                name="confirm-password"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full text-center !mt-8"
          >
            {status === "loading" ? (
              <>
                <CgSpinner className="animate-spin inline-block" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
        </form>
        <div className="w-full"></div>
      </div>
    </div>
  );
}
