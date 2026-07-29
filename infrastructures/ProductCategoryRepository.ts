import { injectable } from "inversify";

import type { IProductCategoryRepository } from "@/interfaces/IProductCategoryRepository";
import type { ProductCategory } from "@/models/ProductCategory";

@injectable()
export class ProductCategoryRepository implements IProductCategoryRepository {
  public async findAll(): Promise<ProductCategory[]> {
    const url = "/ec-proxy-api/product-category/options";

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

      throw new Error(
        errorData.message ??
        errorData.detail ??
        errorData.title ??
        `カテゴリ一覧の取得に失敗しました (Status: ${response.status})`,
      );
    }

    const responseData = (await response.json()) as {
      value: string;
      label: string;
    }[];

    return responseData.map((category) => ({
      categoryUuid: category.value,

      name: category.label,
    }));
  }
}
