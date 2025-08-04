import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  JWT_EXPIRY,
  JWT_EXPIRY_LEEWAY,
  JWT_SECRET,
  UNPROTECTED_ROUTES,
} from "@/config";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import ms from "ms";

async function implicitTokenRefresh(payload: JWTPayload) {
  if (!payload || !payload.exp) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  const leeway = ms(JWT_EXPIRY_LEEWAY);
  if (now >= payload.exp + leeway) {
    // console.debug("Refreshing token");
    return await new SignJWT(payload)
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRY)
      .sign(new TextEncoder().encode(JWT_SECRET));
  }
  return null;
}

// async function verifyUser(uid: string) {
//   const res = await fetch(`/api/verify?uid=${uid}`);
//   if (res.status === 404) {
//     return false;
//   } else if (res.status === 400) {
//     throw new Error("User ID is required");
//   }
//   return true;
// }

async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const cookieJar = cookies();
  const isPublicRoute = UNPROTECTED_ROUTES.some((route) =>
    new RegExp(route).test(path)
  );
  const isLoginPage = path.startsWith("/auth/login");
  const isAPIRoute = path.startsWith("/api");
  const token = cookieJar.get(AUTH_COOKIE_NAME)?.value;
  // console.debug("path", path);

  if (isPublicRoute && !isLoginPage) {
    // console.debug("Unprotected route");
    return NextResponse.next();
  }

  if (!token && !isAPIRoute && !isLoginPage) {
    return NextResponse.redirect(
      new URL("/auth/login?redirect=" + path, req.url)
    );
  }
  if (!token && isAPIRoute && !isLoginPage) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!token && isLoginPage) {
    return NextResponse.next();
  }
  let payload: JWTPayload;
  try {
    payload = (
      await jwtVerify(token as string, new TextEncoder().encode(JWT_SECRET), {
        algorithms: ["HS256"],
      })
    ).payload;
  } catch (e) {
    // console.error("Error verifying JWT", e);
    if (isLoginPage) {
      return NextResponse.next();
    }
    if (isAPIRoute) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(
      new URL("/auth/login?redirect=" + path, req.url)
    );
  }
  const uid = payload.sub;
  if (!uid) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    // console.warn("User ID is required");
    // clear the cookie
    // console.debug("Clearing cookie");
    cookieJar.delete(AUTH_COOKIE_NAME);
    if (isAPIRoute) {
      return NextResponse.json(
        { message: "JWT does not contain uid" },
        { status: 400 }
      );
    }
    return NextResponse.redirect(
      new URL("/auth/login?redirect=" + path, req.url)
    );
  }

  //   const user = await verifyUser(uid);
  //   if (!user) {
  //     console.warn("User not found");
  //     // clear the cookie
  //     console.debug("Clearing cookie");
  //     cookieJar.delete(AUTH_COOKIE_NAME);
  //     if (isAPIRoute) {
  //       return NextResponse.json(
  //         { message: "JWT payload is invalid" },
  //         { status: 401 }
  //       );
  //     }
  //     return NextResponse.redirect("/auth/login?redirect=" + path);
  //   }
  const newToken = await implicitTokenRefresh(payload);
  if (newToken) {
    // console.debug("Setting new token");
    cookieJar.set(AUTH_COOKIE_NAME, newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _assets (metadata files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    "/((?!verify|middleware).*)",
  ],
};

export default middleware;
