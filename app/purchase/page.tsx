import { CartPage } from "@/components/cart/CartPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "買い物かご",
};
export default function Page() {
  return <CartPage />;
}
