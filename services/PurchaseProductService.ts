import { inject, injectable } from "inversify";

import { TYPES } from "@/di/types";

import type { IProductRepository } from "@/interfaces/IProductRepository";

import type { IPurchaseProductService } from "@/interfaces/IPurchaseProductService";

import type { Product } from "@/models/Product";

import { ProductDetail } from "@/models/ProductDetail";

@injectable()
export class PurchaseProductService implements IPurchaseProductService {
  constructor(
    @inject(TYPES.IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * カテゴリを指定して商品を取得する
   *
   * カテゴリUUIDが未指定の場合は、
   * 全件取得する。
   *
   * @param productCategoryUuid 商品カテゴリUUID
   * @returns 商品一覧
   */
  public async findByCategory(
    productCategoryUuid?: string,
  ): Promise<Product[]> {
    return await this.productRepository.findByCategory(productCategoryUuid);
  }

  /**
   * 商品UUIDから商品を1件取得する
   *
   * @param productUuid 商品UUID
   * @returns 商品情報。存在しない場合はnull
   */
  public async findById(productUuid: string): Promise<ProductDetail | null> {
    return await this.productRepository.findById(productUuid);
  }

  /**
   * 商品の購入を確定する
   *
   * バックエンドの購入確定APIへ、
   * 支払い方法と購入商品一覧をまとめて送信する。
   *
   * @param paymentMethodId 支払い方法ID
   * @param items 購入商品一覧
   */
  public async purchase(
    paymentMethodId: number,
    items: {
      productUuid: string;
      quantity: number;
    }[],
  ): Promise<void> {
    if (!Number.isInteger(paymentMethodId) || paymentMethodId <= 0) {
      throw new Error("支払い方法を選択してください。");
    }

    if (items.length === 0) {
      throw new Error("購入する商品がありません。");
    }

    const hasInvalidItem = items.some(
      (item) =>
        !item.productUuid ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0,
    );

    if (hasInvalidItem) {
      throw new Error("購入商品の内容が不正です。");
    }

    /*
     * 商品ごとに呼び出さず、
     * 購入確定APIを1回だけ呼び出す。
     */
    await this.productRepository.purchase(paymentMethodId, items);
  }
}
