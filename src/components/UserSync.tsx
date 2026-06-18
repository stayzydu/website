"use client";
import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

export default function UserSync() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || synced.current) return;
    synced.current = true;

    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/sync-user", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          console.error("[UserSync] sync failed:", res.status);
          synced.current = false;
        }
      } catch (err) {
        console.error("[UserSync] sync error:", err);
        synced.current = false;
      }
    })();
  }, [isLoaded, isSignedIn, user?.id, getToken]);

  return null;
}
