import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    if (!BACKEND_URL) {
      return NextResponse.json(
        { message: "Backend API URL not defined" },
        { status: 500 }
      );
    }

    // ✅ Call your backend using ENV URL
    const backendRes = await fetch(
      `${BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // ✅ ✅ ✅ Set cookie on FRONTEND domain (this fixes your redirect issue)
    const response = NextResponse.json(data);

    response.cookies.set("kzarre_token", data.token, {
      httpOnly: true,
      secure: true,          // ✅ required on Vercel
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Frontend login proxy error:", err);
    return NextResponse.json(
      { message: "Login proxy failed" },
      { status: 500 }
    );
  }
}
