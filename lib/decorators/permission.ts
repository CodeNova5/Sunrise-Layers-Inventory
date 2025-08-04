import { Permission } from "../permissions/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import User, { IUserDocument } from "../common/models/user";
import { jwtVerify} from "jose";
import { AUTH_COOKIE_NAME, JWT_SECRET } from "../../config";
import { buildErrorResponse, Forbidden, Unauthorized } from "../errors";

type AuthContext = {
  user: IUserDocument;
};

/**
 * Protect  route by requiring a permission
 * @param permission
 * @returns
 */
export default function permissionRequired<T>(permission: Permission) {
  // @ts-ignore
  return function <Args extends any[]>(
    handler: T extends (
      this: infer R,
      ...args: [NextRequest, ...Args]
    ) => NextResponse
      ? (
          this: R & AuthContext,
          ...args: [NextRequest, ...Args]
        ) => Promise<NextResponse>
      : (
          this: AuthContext,
          ...args: [NextRequest, ...Args]
        ) => Promise<NextResponse>
  ) {
    return async function (
      this: AuthContext | any,
      ...args: [NextRequest, ...Args]
    ): Promise<NextResponse> {
      const cookieJar = cookies();
      const token = cookieJar.get(AUTH_COOKIE_NAME)?.value;
      const req = args[0];
      if (!token) {
        return Unauthorized.construct("Token not found");
      }
      // decode the token and check for the required permissions
      const { payload } = await jwtVerify(
        token as string,
        new TextEncoder().encode(JWT_SECRET),
        {
          algorithms: ["HS256"],
        }
      );
      if (!payload || !payload.sub) {
        return Unauthorized.construct("Invalid token");
      }
      const user = await User.findById(payload.sub);
      if (!user) {
        return Unauthorized.construct("User not found");
      }
      const context = this || {};
      context.user = user;
      if (!(await permission.hasPermission(user, req))) {
        return Forbidden.construct("Permission denied");
      }
      try {
        return await handler.call(context, ...args);
      } catch (error) {
        console.error(error)
        return buildErrorResponse(error);
      }
    };
  };
}
