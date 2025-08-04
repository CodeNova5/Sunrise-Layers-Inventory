import { phone } from "phone";
import { ValidationError } from "../errors";

export function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    ValidationError.throw("email", email, "Invalid email address");
  }
  return email;
}

export function validatePassword(password: string): string {
  if (password.length < 8) {
    ValidationError.throw("password", password, "Password must be at least 8 characters long");
  }
  return password;
}

export function validateFirstName(fname: string): string {
  if (fname.length < 1) {
    ValidationError.throw("fname", fname, "First name must be at least 1 character long");
  } else if (fname.length > 50) {
    ValidationError.throw("fname", fname, "First name must not be more than 50 characters long");
  }
  return fname;
}

export function validateLastName(lname: string): string {
  if (lname.length < 1) {
    ValidationError.throw("lname", lname, "Last name must be at least 1 character long");
  } else if (lname.length > 50) {
    ValidationError.throw("lname", lname, "Last name must not be more than 50 characters long");
  }
  return lname;
}

export function validatePhoneNumber(phoneNumber: string): string {
  const output = phone(phoneNumber, { country: "NG" });
  if (!output.isValid) {
    ValidationError.throw("phoneNumber", phoneNumber, "Invalid phone number");
  }
  return output.phoneNumber;
}
