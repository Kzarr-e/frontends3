"use client";

import Header from "./Header";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackVisit } from "../utils/trafficTracker";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    trackVisit();
  }, [pathname]);

  return (
    <>
      <CookieBanner />
      <Header />
      {children}
      <Footer />
    </>
  );
}
