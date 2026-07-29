import { Product } from "@/models/Product";
import { ProductDetail } from "@/models/ProductDetail";

export interface IPurchaseProductService {
  findByCategory(productCategoryUuid?: string): Promise<Product[]>;

  /**
   * 商品UUIDから商品を1件取得する
   *
   * @param productUuid 商品UUID
   * @returns 商品情報。存在しない場合はnull
   */
  findById(productUuid: string): Promise<ProductDetail | null>;

  purchase(
    paymentMethodId: number,
    items: {
      productUuid: string;
      quantity: number;
    }[],
  ): Promise<void>;
}
