"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const auth = isAuthenticated();
    setAllowed(auth);
    setChecked(true);
    if (!auth) {
      router.replace("/login");
    }
  }, [router]);

  if (!checked) {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return children;
}
