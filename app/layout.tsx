import type { Metadata } from "next";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import { Header } from "@/components/layout/Header";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "フルネス文具",
    template: "%s | フルネス文具",
  },
  description: "文房具を販売するオンラインショップです。",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body>
        <CartProvider>
          <CustomerAuthProvider>
            <Header />

            <main>{children}</main>
          </CustomerAuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
