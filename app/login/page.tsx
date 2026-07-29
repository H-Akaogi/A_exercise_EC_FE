import { CustomerLoginForm } from "@/components/auth/CustomerLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
};

/**
 * FP002 顧客ログイン画面。
 */
export default function LoginPage() {
  return <CustomerLoginForm />;
}
