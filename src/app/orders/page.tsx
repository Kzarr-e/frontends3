"use client";

import { useSearchParams } from "next/navigation";
import OrderDetailsPage from "./OrderDetailsPage";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return <div>Order not found</div>;
  }

  return <OrderDetailsPage id={id} />;
}