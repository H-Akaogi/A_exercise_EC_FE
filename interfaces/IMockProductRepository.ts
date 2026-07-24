import { Product } from "../models/Product";
/**
 * 演習 6-2 データアクセスとサービスを実装する
 * 商品リポジトリインターフェース
 */
export interface IMockProductRepository {
    /**
     * 指定したキーワードで商品を検索して取得する
     * @param keyword 検索キーワード
     * @returns 検索にヒットした商品のリスト（非同期）
     */
    searchKeyword(keyword: string): Promise<Product[]>;

    updateProduct(
        productUuid: string,
        name: string,
        price: number
    ): Promise<Product | null>;

    findAll(): Promise<Product[]>

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