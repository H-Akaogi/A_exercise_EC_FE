import type { Customer } from "@/models/Customer";

/**
 * 顧客登録フォーム取得レスポンス
 */
export interface CustomerFormResponse {
  /**
   * 画面タイトル
   */
  title: string;

  /**
   * 顧客入力情報
   */
  model: Customer;
}
