import type { SearchOrdersResponse } from "@/models/SearchOrdersResponse";

import type { Orders } from "@/models/Orders";

/**
 * 注文Repository
 */
export interface IOrderRepository {
  /**
   * ログイン中の顧客の購入履歴を取得する
   *
   * @returns 購入履歴一覧
   */
  findPurchaseHistory(): Promise<SearchOrdersResponse>;

  /**
   * 注文UUIDから購入履歴詳細を取得する
   *
   * @param orderUuid 注文UUID
   * @returns 注文詳細
   */
  findById(orderUuid: string): Promise<Orders>;
}
