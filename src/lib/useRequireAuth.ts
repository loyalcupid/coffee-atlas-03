"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setAuthLoading(false);
      } else {
        setAuthLoading(false);
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    });
    return () => unsub();
  }, [router, pathname]);

  return { user, authLoading };
}
