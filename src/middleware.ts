"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MaintenanceGuard() {
  const router = useRouter();

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/system`
        );

        if (!res.ok) return;

        const data = await res.json();

        const maintenance =
          data?.config?.maintenance?.maintenanceMode === true;

        if (maintenance) {
          router.replace("/maintenance");
        }
      } catch (err) {
        console.error("Maintenance check failed", err);
      }
    }

    checkMaintenance();
  }, [router]);

  return null;
}