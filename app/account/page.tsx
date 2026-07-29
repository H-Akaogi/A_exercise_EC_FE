import { CustomerAccountRegister } from "@/components/account/CustomerAccountRegister";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "アカウント登録",
};

export default function AccountPage() {
  return <CustomerAccountRegister />;
}
