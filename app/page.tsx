import { TopPage } from "@/components/purchase/TopPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "トップ | フルネス文具",
};
export default function HomePage() {
  return <TopPage />;
}
