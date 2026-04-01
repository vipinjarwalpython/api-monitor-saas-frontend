"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function ProtectedRoute({ children }: any) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login"); 
    }
  }, []);

  return children;
}