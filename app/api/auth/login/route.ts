import { NextRequest, NextResponse } from "next/server";
import { UserDAO } from "@/lib/common/dao";
import { cookies } from "next/headers";
import {
  EntityNotFound,
  PasswordError,
  serializeError,
  buildErrorResponse,
} from "@/lib/errors";
import { LoginError } from "@/lib/errors";
import withErrorBoundary from "@/lib/decorators/error-boundary";

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  email: string;
  lastName: string;
  firstName: string;
  phone: string;
}

export const POST = withErrorBoundary(async function (req: NextRequest) {
  const { email, password } = (await req.json()) as LoginData;
  if (!email || !password) {
    return NextResponse.json(
      {
        message: "Email and password are required",
      },
      { status: 400 }
    );
  }
  try {
    const { token, user } = await UserDAO.authenticateUser(email, password);
    const response: LoginResponse = {
      id: user.id,
      email: user.email!,
      lastName: user.lastName,
      firstName: user.firstName,
      phone: user.phone!,
    };
    cookies().set("X-Auth-Token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
    });
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof EntityNotFound || error instanceof PasswordError) {
      return new LoginError("Could not authenticate user", {
        cause: error.serialize(),
      }).toResponse(401);
    }
    return buildErrorResponse(error, 500);
  }
});
