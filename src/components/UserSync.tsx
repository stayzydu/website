"use client";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserSync() {
  const { isSignedIn, isLoaded, user } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    console.log("[UserSync] isLoaded=", isLoaded, "isSignedIn=", isSignedIn, "synced=", synced.current);
    if (!isLoaded || !isSignedIn || synced.current) return;
    synced.current = true;
    console.log("[UserSync] Calling /api/sync-user for", user?.primaryEmailAddress?.emailAddress);
    fetch("/api/sync-user", { method: "POST" })
      .then(r => r.json())
      .then(data => console.log("[UserSync] Sync result:", data))
      .catch(err => console.error("[UserSync] Sync error:", err));
  }, [isLoaded, isSignedIn, user]);

  return null;
}
