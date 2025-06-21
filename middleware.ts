import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🛑 قائمة الـ IPs الممنوعة
const bannedIPs = ["156.196.222.180"];

export function middleware(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0].trim() || "unknown";

  if (bannedIPs.includes(ip)) {
    console.log(`🚫 Blocked IP from accessing: ${ip}`);
    return new NextResponse("Access Denied", { status: 403 });
  }

  return NextResponse.next();
}
