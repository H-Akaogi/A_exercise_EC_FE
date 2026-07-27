import { Product } from "../models/Product";
/**
 * 演習 6-2 データアクセスとサービスを実装する
 * 商品リポジトリインターフェース
 */
export interface IProductRepository {

    /**
   * 商品を検索する
   *
   * カテゴリUUIDが未指定の場合は全件取得する。
   *
   * @param productCategoryUuid 商品カテゴリUUID
   * @returns 商品一覧
   */
    findByCategory(
        productCategoryUuid?: string,
    ): Promise<Product[]>;

    /**
    * 商品UUIDを指定して商品を1件取得する
    *
    * @param productUuid 商品UUID
    * @returns 該当する商品。存在しない場合はnull
    */
    findById(
        productUuid: string,
    ): Promise<Product | null>;


    /**
     * 購入された分だけ商品の在庫を減らす関数
     * @param productUuid 商品のUUID
     * @param quantity 商品の在庫数
     * @returns 在庫変更後の商品情報
     */
    purchase(
        paymentMethodId: number,
        items: {
            productUuid: string;
            quantity: number;
        }[],
    ): Promise<void>;
}