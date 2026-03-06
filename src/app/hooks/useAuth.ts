"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(protect = false) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function syncAuth() {
      const t = localStorage.getItem("kzarre_token");
      setToken(t);
      setReady(true);

      if (protect && !t) {
        router.replace("/login");
      }
    }

    syncAuth();

    // ✅ LISTEN FOR LOGIN EVENT
    window.addEventListener("auth-change", syncAuth);
    return () => window.removeEventListener("auth-change", syncAuth);
  }, [protect, router]);

  return { token, ready };
}
