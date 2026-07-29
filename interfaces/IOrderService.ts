import type { Orders } from "@/models/Orders";

import type { SearchOrdersResponse } from "@/models/SearchOrdersResponse";

/**
 * 注文Service
 */
export interface IOrderService {
  /**
   * ログイン中の顧客の購入履歴を取得する
   */
  findPurchaseHistory(): Promise<SearchOrdersResponse>;

  /**
   * 注文UUIDから購入履歴詳細を取得する
   *
   * @param orderUuid 注文UUID
   */
  findById(orderUuid: string): Promise<Orders>;
}
