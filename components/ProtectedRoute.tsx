"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const allowed = isAuthenticated();

  useEffect(() => {
    if (!allowed) {
      router.replace("/login");
    }
  }, [allowed, router]);

  if (!allowed) {
    return null;
  }

  return children;
}
