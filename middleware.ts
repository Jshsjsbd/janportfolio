import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🚫 قائمة الـ IPs الممنوعة
const bannedIPs = ["123.45.67.89", "98.76.54.32"];

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "";

  if (bannedIPs.includes(ip)) {
    return new NextResponse("Access Denied", {
      status: 403,
    });
  }

  return NextResponse.next();
}
