import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST() {
  console.log("[sync-user] Step 1: Route hit");

  try {
    const { getToken } = await auth();
    const user = await currentUser();

    console.log("[sync-user] Step 2: Clerk user =", user?.id, user?.emailAddresses?.[0]?.emailAddress);

    if (!user) {
      console.log("[sync-user] ERROR: No Clerk user found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = await getToken();
    console.log("[sync-user] Step 3: Got token =", token ? "YES (length " + token.length + ")" : "NO TOKEN");

    const body = {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    };
    console.log("[sync-user] Step 4: Sending to backend =", body);

    const res = await fetch(`${API}/api/users/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("[sync-user] Step 5: Backend responded with status =", res.status);

    const data = await res.json();
    console.log("[sync-user] Step 6: Backend response =", data);

    return NextResponse.json(data);
  } catch (err) {
    console.error("[sync-user] EXCEPTION:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
