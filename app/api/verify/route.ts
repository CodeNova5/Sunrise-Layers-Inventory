import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/common/models/user";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }
  const user = await User.findOne({ _id: uid }, { id: 1 }).exec();
  if (!user) {
    return NextResponse.json({}, { status: 404 });
  }
  return NextResponse.json({});
}
