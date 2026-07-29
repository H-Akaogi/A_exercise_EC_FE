import { ProductDetail } from "@/components/purchase/ProductDetail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "商品詳細",
};
export default function ProductDetailPage() {
  return <ProductDetail />;
}
