import { Product } from "../models/Product";
/**
 * 演習 6-2 データアクセスとサービスを実装する
 * 商品リポジトリインターフェース
 */
export interface IMockProductRepository {

    findAll(): Promise<Product[]>

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
    purchaseProduct(
        productUuid: string,
        quantity: number
    ): Promise<Product | null>;
}