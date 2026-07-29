import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

import { ProductCategoryService } from "@/services/ProductCategoryService";

import type { IProductCategoryRepository } from "@/interfaces/IProductCategoryRepository";

import type { ProductCategory } from "@/models/ProductCategory";

describe("ProductCategoryService", () => {
  let service: ProductCategoryService;

  /*
   * 実際のProductCategoryRepositoryは使用せず、
   * Repository全体をVitestのモックとして扱う。
   */
  let productCategoryRepositoryMock: Mocked<IProductCategoryRepository>;

  beforeEach(() => {
    /*
     * Repositoryの各メソッドを
     * vi.fn()でモック化する。
     */
    productCategoryRepositoryMock = {
      findAll: vi.fn(),
    };

    /*
     * モックRepositoryをServiceへ注入する。
     */
    service = new ProductCategoryService(productCategoryRepositoryMock);
  });

  describe("findAll", () => {
    it("Repositoryから取得したカテゴリ一覧を返す", async () => {
      const expectedCategories: ProductCategory[] = [
        {
          categoryUuid: "category-uuid-001",
          name: "食品",
        },
        {
          categoryUuid: "category-uuid-002",
          name: "飲料",
        },
        {
          categoryUuid: "category-uuid-003",
          name: "日用品",
        },
      ];

      /*
       * Repositoryが返すカテゴリ一覧を設定する。
       */
      productCategoryRepositoryMock.findAll.mockResolvedValue(
        expectedCategories,
      );

      const result = await service.findAll();

      /*
       * ServiceからRepositoryのfindAllが
       * 1回呼ばれたことを確認する。
       */
      expect(productCategoryRepositoryMock.findAll).toHaveBeenCalledTimes(1);

      /*
       * findAllには引数がないことを確認する。
       */
      expect(productCategoryRepositoryMock.findAll).toHaveBeenCalledWith();

      /*
       * Repositoryの戻り値を
       * Serviceがそのまま返すことを確認する。
       */
      expect(result).toEqual(expectedCategories);
    });

    it("カテゴリが存在しない場合は空配列を返す", async () => {
      productCategoryRepositoryMock.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);

      expect(productCategoryRepositoryMock.findAll).toHaveBeenCalledTimes(1);
    });

    it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
      productCategoryRepositoryMock.findAll.mockRejectedValue(
        new Error("カテゴリ一覧の取得に失敗しました。"),
      );

      await expect(service.findAll()).rejects.toThrow(
        "カテゴリ一覧の取得に失敗しました。",
      );

      expect(productCategoryRepositoryMock.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
