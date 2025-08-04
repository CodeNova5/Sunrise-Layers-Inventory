import { NextRequest, NextResponse } from "next/server";
import { buildErrorResponse } from "../errors";

export default function withErrorBoundary<Fn extends (...args: any[]) => (Promise<NextResponse>|NextResponse)>(
  handler: Fn
): (...args: Parameters<Fn>) => Promise<NextResponse> {
  return async function (...args: Parameters<Fn>) {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(error);
      return buildErrorResponse(error);
    }
  };
}