import { TopPage } from "@/components/purchase/TopPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "トップページ",
};
export default function HomePage() {
  return <TopPage />;
}
