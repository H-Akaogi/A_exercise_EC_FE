import { inject, injectable } from "inversify";

import { TYPES } from "@/di/types";
import type { ICustomerAuthService } from "@/interfaces/ICustomerAuthService";
import type { IProductRepository } from "../interfaces/IProductRepository";
import type { Product } from "../models/Product";
import { ProductDetail } from "@/models/ProductDetail";

/**
 * 演習 6-2 データアクセスとサービスを実装する
 * 商品リポジトリの実装（モック）
 */
@injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @inject(TYPES.ICustomerAuthService)
    private readonly customerAuthService: ICustomerAuthService,
  ) { }

  /**
   * 商品を検索する
   *
   * カテゴリUUIDが未指定の場合は全件取得する。
   *
   * @param productCategoryUuid 商品カテゴリUUID
   * @returns 商品一覧
   */
  public async findByCategory(
    productCategoryUuid?: string,
  ): Promise<Product[]> {
    const params = new URLSearchParams();

    /*
     * UUIDが指定されている場合だけ
     * クエリパラメータへ追加する。
     */
    if (productCategoryUuid && productCategoryUuid.trim() !== "") {
      params.set("productCategoryUuid", productCategoryUuid);
    }

    const query = params.toString();

    const url = query
      ? `/ec-proxy-api/product/search?${query}`
      : "/ec-proxy-api/product/search";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
        detail?: string;
        title?: string;
      };

      console.error("========== PRODUCT SEARCH API ERROR ==========");
      console.error("url:", url);
      console.error("status:", response.status);
      console.error("error body:", errorData);
      console.error("==============================================");

      throw new Error(
        errorData.message ??
        errorData.detail ??
        errorData.title ??
        `商品一覧の取得に失敗しました (Status: ${response.status})`,
      );
    }

    return (await response.json()) as Product[];
  }

  /**
   * 商品UUIDを指定して商品を取得する
   */
  public async findById(productUuid: string): Promise<ProductDetail | null> {
    const url = `/ec-proxy-api/products/detail/${encodeURIComponent(productUuid)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.status === 404) {
      return null;
    }

    return await response.json();
  }

  /**
   * 商品の購入を確定する
   *
   * 注文履歴の登録と在庫減少は、
   * バックエンドの購入確定API内で行われる。
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
    const url = "/ec-proxy-api/purchase/complete";

    /*
     * フロント側でも最低限の入力確認を行う。
     */
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

    const accessToken = this.customerAuthService.getAccessToken();

    if (!accessToken) {
      this.customerAuthService.clearAuthentication();

      throw new Error("購入するにはログインが必要です。");
    }

    const requestBody = {
      paymentMethodId,
      items: items.map((item) => ({
        productUuid: item.productUuid,
        quantity: item.quantity,
      })),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    if (response.status === 401) {
      this.customerAuthService.clearAuthentication();

      throw new Error("購入するにはログインが必要です。");
    }

    if (response.status === 404) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
        detail?: string;
        title?: string;
      };

      throw new Error(
        errorData.message ??
        errorData.detail ??
        errorData.title ??
        "商品または支払い方法が見つかりませんでした。",
      );
    }

    if (!response.ok) {
      const responseText = await response.text();

      let errorMessage =
        `商品の購入に失敗しました` + ` (Status: ${response.status})`;

      if (responseText) {
        try {
          const errorData = JSON.parse(responseText) as {
            message?: string;
            detail?: string;
            title?: string;
            errors?: Record<string, string[] | string>;
          };

          if (errorData.errors) {
            errorMessage = Object.values(errorData.errors).flat().join("\n");
          } else {
            errorMessage =
              errorData.message ??
              errorData.detail ??
              errorData.title ??
              errorMessage;
          }
        } catch {
          errorMessage = responseText;
        }
      }

      console.error("========== PURCHASE COMPLETE API ERROR ==========");
      console.error("url:", url);
      console.error("request body:", requestBody);
      console.error("status:", response.status);
      console.error("response body:", responseText);
      console.error("=================================================");

      throw new Error(errorMessage);
    }
  }
}
