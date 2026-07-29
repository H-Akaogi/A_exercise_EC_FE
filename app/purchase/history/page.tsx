import { PurchaseHistory } from "@/components/purchase/PurchaseHistory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "購入履歴",
};
export default function PurchaseHistoryPage() {
  return <PurchaseHistory />;
}
