"use client";

import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-montserrat",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ❌ Routes where Header/Footer should NOT appear
  const hideLayout =
    pathname === "/maintenance" ||
    pathname === "/loading";

  return (
    <html lang="en">
      <body className={montserrat.variable}>
        {/* {!hideLayout && <Header />} */}

        {children}

        {/* {!hideLayout && <Footer />} */}
      </body>
    </html>
  );
}
