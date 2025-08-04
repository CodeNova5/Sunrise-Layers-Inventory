import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/config";

export async function POST(req: NextRequest) {
    cookies().delete(AUTH_COOKIE_NAME);
    return new Response(null, {
        status: 204,
    });
}