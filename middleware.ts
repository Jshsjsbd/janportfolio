import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🛑 IPs الممنوعة
const bannedIPs = ["156.196.222.180"];

export function middleware(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0].trim();

  if (bannedIPs.includes(ip)) {
    console.log(`🚫 تم حظر الـ IP: ${ip}`);
    return new NextResponse("Access Denied", { status: 403 });
  }

  return NextResponse.next();
}
