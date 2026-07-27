import type { Customer } from "@/models/Customer";
import type { CustomerFormResponse } from "@/models/CustomerFormResponse";
import type { CustomerCompleteResponse } from "@/models/CustomerCompleteResponse";

/**
 * 社員アカウントRepositoryインターフェイス
 */
export interface ICustomerRepository {
  /**
   * 顧客登録フォームの初期情報を取得する
   */
  getForm(): Promise<CustomerFormResponse>;

  /**
   * アカウント名が既に存在するか確認する
   */
  existsByAccountName(accountName: string): Promise<boolean>;

  /**
   * メールアドレスが既に存在するか確認する
   */
  existsByMail(mail: string): Promise<boolean>;

  /**
  * 顧客登録を完了する
  */
  create(customer: Customer,): Promise<CustomerCompleteResponse>;
}
