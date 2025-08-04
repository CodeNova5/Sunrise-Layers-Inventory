import bcrypt from "bcrypt";
import { SignJWT, type JWTPayload } from "jose";
import UserModel, { IUserDocument } from "../models/user";
import mongoose, { FilterQuery } from "mongoose";
import {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhoneNumber,
} from "../validation";
import { JWT_EXPIRY, JWT_SECRET } from "../../../config";
import {
  EntityNotFound,
  IntegrityError,
  PageNotFound,
  PasswordError,
} from "../../errors";
import { UpdateUser, User } from "../../@types/user";
import GroupModel, { IGroupDocument } from "../models/group";

interface createUserParams {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface PaginatedUsers {
  users: User[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  next: number | null;
  prev: number | null;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

async function transformUser(
  user: IUserDocument,
  addGroups = false
): Promise<User> {
  let groups: IGroupDocument[] = [];
  if (addGroups) {
    groups = await GroupModel.find(
      { members_ids: user._id, isDeleted: false },
      {
        _id: 1,
        name: 1,
        permissions: 1,
      }
    );
  }
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.status,
    permissions: user.permissions,
    groups: groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      permissions: group.permissions,
    })),
    phone: user.phone.replace("+234", "0"),
  };
}

async function addUser({
  firstName,
  lastName,
  email,
  phone,
  password,
}: createUserParams) {
  firstName = validateFirstName(firstName);
  lastName = validateLastName(lastName);
  email = validateEmail(email);
  phone = validatePhoneNumber(phone);
  password = validatePassword(password);

  if (
    (await UserModel.countDocuments({ email, isDeleted: false }).exec()) > 0
  ) {
    IntegrityError.throw(
      "email",
      {
        code: "user_email_exists",
        email,
      },
      "An account with that email already exists."
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new UserModel({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
  });
  await user.save();
  return await transformUser(user);
}

async function getUsers({
  filters,
  page = 1,
  limit = 10,
}: {
  filters: FilterQuery<IUserDocument>;
  page: number;
  limit: number;
}): Promise<PaginatedUsers> {
  if (page < 1) {
    PageNotFound.throw(page, "User", { query: filters, limit });
  }
  if (limit < 1) {
    PageNotFound.throw(page, "User", { query: filters, limit });
  }

  const query = filters ? filters : {};
  query.isDeleted = false;
  const totalDocs = await UserModel.countDocuments(query).exec();
  const totalPages = Math.ceil(totalDocs / limit);
  if (page > 1 && page > totalPages) {
    PageNotFound.throw(page, "User", { query: filters, limit });
  }
  const skip = (page - 1) * limit;
  const users = await UserModel.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ firstName: 1, lastName: 1 })
    .lean()
    .exec();
  const next = users.length === limit ? page + 1 : null;
  const prev = page > 1 ? page - 1 : null;
  return {
    // @ts-ignore
    users: await Promise.all(users.map(transformUser)),
    totalDocs,
    limit,
    page,
    totalPages,
    next,
    prev,
    hasPrevPage: prev !== null,
    hasNextPage: next !== null,
  };
}

async function updateUser(
  id: mongoose.Types.ObjectId,
  params: UpdateUser
): Promise<User> {
  const firstName = params.firstName
    ? validateFirstName(params.firstName)
    : undefined;
  const lastName = params.lastName
    ? validateLastName(params.lastName)
    : undefined;
  const email = params.email ? validateEmail(params.email) : undefined;
  const phone = params.phone ? validatePhoneNumber(params.phone) : undefined;
  const password = params.password
    ? validatePassword(params.password)
    : undefined;
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  if (
    email &&
    (await UserModel.countDocuments({
      email,
      _id: { $ne: id },
      isDeleted: false,
    }).exec()) > 0
  ) {
    IntegrityError.throw(
      "email",
      {
        code: "user_email_exists",
        email,
      },
      "An account with this email already exists."
    );
  }
  const user = await UserModel.findOne({ _id: id, isDeleted: false });
  if (!user) {
    EntityNotFound.throw("User", id.toString());
  }
  const payload: any = {};
  if (firstName) {
    payload.firstName = firstName;
  }
  if (lastName) {
    payload.lastName = lastName;
  }
  if (email) {
    payload.email = email;
  }
  if (phone) {
    payload.phone = phone;
  }
  if (passwordHash) {
    payload.password = passwordHash;
  }
  if (!payload) return transformUser(user, true);
  await user.updateOne(payload, { new: true });
  return await transformUser(
    (await UserModel.findOne({ _id: id, isDeleted: false }))!,
    true
  );
}

async function deleteUser(id: mongoose.Types.ObjectId) {
  const user = await UserModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!user) {
    EntityNotFound.throw("User", {
      id: id.toString(),
      isDeleted: "false",
    });
  }
  return await transformUser(user);
}

async function authenticateUser(email: string, password: string) {
  const user = await UserModel.findOne({ email, isDeleted: false });
  if (!user) {
    EntityNotFound.throw("User", { email });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    PasswordError.throw(password, user._id.toString(), "Invalid password");
  }
  const payload: JWTPayload = { sub: user._id.toHexString() };
  const token = await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(new TextEncoder().encode(JWT_SECRET));
  return { token, user: await transformUser(user, true) };
}

async function getUser(id: mongoose.Types.ObjectId) {
  const user = await UserModel.findOne(
    { _id: id, isDeleted: false },
    { password: 0, __v: 0, isDeleted: 0 }
  )
    .lean()
    .exec();
  if (!user) {
    EntityNotFound.throw("User", {
      id: id.toString(),
      isDeleted: "false",
    });
  }
  return await transformUser(user, true);
}

async function setUserStatus(
  id: mongoose.Types.ObjectId,
  status: "banned" | "active"
) {
  const user = await UserModel.findOne({ _id: id, isDeleted: false });
  if (!user) {
    EntityNotFound.throw("User", {
      id: id.toString(),
      isDeleted: "false",
    });
  }
  user.status = status;
  await user.save();
  return await transformUser(user, true);
}

const UserDAO = {
  addUser,
  getUsers,
  deleteUser,
  updateUser,
  authenticateUser,
  getUser,
  setUserStatus,
};

export default UserDAO;
