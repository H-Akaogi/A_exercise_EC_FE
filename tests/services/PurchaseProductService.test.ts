import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

import { PurchaseProductService } from "@/services/PurchaseProductService";

import type { IProductRepository } from "@/interfaces/IProductRepository";

import type { Product } from "@/models/Product";

import type { ProductDetail } from "@/models/ProductDetail";

describe("PurchaseProductService", () => {
  let service: PurchaseProductService;

  /*
   * 実際のProductRepositoryは使用せず、
   * IProductRepositoryを完全にモック化する。
   */
  let productRepositoryMock: Mocked<IProductRepository>;

  beforeEach(() => {
    productRepositoryMock = {
      findByCategory: vi.fn(),

      findById: vi.fn(),

      purchase: vi.fn(),
    };

    service = new PurchaseProductService(productRepositoryMock);
  });

  describe("findByCategory", () => {
    it("カテゴリUUIDをRepositoryへ渡して商品一覧を返す", async () => {
      const expectedProducts: Product[] = [
        {
          productUuid: "product-uuid-001",
          name: "商品A",
          price: 1000,
          imageUrl: null,
          productCategory: null,
          productStock: null,
          deleteFlg: 0,
        },
        {
          productUuid: "product-uuid-002",
          name: "商品B",
          price: 2000,
          imageUrl: null,
          productCategory: null,
          productStock: null,
          deleteFlg: 0,
        },
      ];

      productRepositoryMock.findByCategory.mockResolvedValue(expectedProducts);

      const result = await service.findByCategory("category-uuid-001");

      expect(productRepositoryMock.findByCategory).toHaveBeenCalledTimes(1);

      expect(productRepositoryMock.findByCategory).toHaveBeenCalledWith(
        "category-uuid-001",
      );

      expect(result).toEqual(expectedProducts);
    });

    it("カテゴリUUIDが未指定の場合はundefinedをRepositoryへ渡す", async () => {
      productRepositoryMock.findByCategory.mockResolvedValue([]);

      const result = await service.findByCategory();

      expect(productRepositoryMock.findByCategory).toHaveBeenCalledWith(
        undefined,
      );

      expect(result).toEqual([]);
    });

    it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
      productRepositoryMock.findByCategory.mockRejectedValue(
        new Error("商品一覧の取得に失敗しました。"),
      );

      await expect(service.findByCategory("category-uuid-001")).rejects.toThrow(
        "商品一覧の取得に失敗しました。",
      );

      expect(productRepositoryMock.findByCategory).toHaveBeenCalledWith(
        "category-uuid-001",
      );
    });
  });

  describe("findById", () => {
    it("商品UUIDをRepositoryへ渡して商品詳細を返す", async () => {
      const expectedProduct: ProductDetail = {
        productUuid: "product-uuid-001",
        productName: "商品A",
        price: 1000,
        productImage: "image",
        stockQuantity: 3,
      };

      productRepositoryMock.findById.mockResolvedValue(expectedProduct);

      const result = await service.findById("product-uuid-001");

      expect(productRepositoryMock.findById).toHaveBeenCalledTimes(1);

      expect(productRepositoryMock.findById).toHaveBeenCalledWith(
        "product-uuid-001",
      );

      expect(result).toEqual(expectedProduct);
    });

    it("商品が存在しない場合はnullを返す", async () => {
      productRepositoryMock.findById.mockResolvedValue(null);

      const result = await service.findById("not-found-product");

      expect(result).toBeNull();

      expect(productRepositoryMock.findById).toHaveBeenCalledWith(
        "not-found-product",
      );
    });

    it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
      productRepositoryMock.findById.mockRejectedValue(
        new Error("商品詳細の取得に失敗しました。"),
      );

      await expect(service.findById("product-uuid-001")).rejects.toThrow(
        "商品詳細の取得に失敗しました。",
      );

      expect(productRepositoryMock.findById).toHaveBeenCalledWith(
        "product-uuid-001",
      );
    });
  });

  describe("purchase", () => {
    const validItems = [
      {
        productUuid: "product-uuid-001",
        quantity: 2,
      },
      {
        productUuid: "product-uuid-002",
        quantity: 1,
      },
    ];

    it("正しい支払い方法と商品一覧をRepositoryへ渡して購入を確定する", async () => {
      productRepositoryMock.purchase.mockResolvedValue(undefined);

      await expect(service.purchase(1, validItems)).resolves.toBeUndefined();

      expect(productRepositoryMock.purchase).toHaveBeenCalledTimes(1);

      expect(productRepositoryMock.purchase).toHaveBeenCalledWith(
        1,
        validItems,
      );
    });

    it("複数商品でもRepositoryのpurchaseを1回だけ呼び出す", async () => {
      productRepositoryMock.purchase.mockResolvedValue(undefined);

      await service.purchase(2, validItems);

      expect(productRepositoryMock.purchase).toHaveBeenCalledTimes(1);

      expect(productRepositoryMock.purchase).toHaveBeenCalledWith(
        2,
        validItems,
      );
    });

    describe("支払い方法IDの入力チェック", () => {
      it.each([
        {
          title: "0",
          paymentMethodId: 0,
        },
        {
          title: "負数",
          paymentMethodId: -1,
        },
        {
          title: "小数",
          paymentMethodId: 1.5,
        },
        {
          title: "NaN",
          paymentMethodId: Number.NaN,
        },
        {
          title: "正の無限大",
          paymentMethodId: Number.POSITIVE_INFINITY,
        },
      ])(
        "支払い方法IDが$titleの場合は例外を投げる",
        async ({ paymentMethodId }) => {
          await expect(
            service.purchase(paymentMethodId, validItems),
          ).rejects.toThrow("支払い方法を選択してください。");

          expect(productRepositoryMock.purchase).not.toHaveBeenCalled();
        },
      );
    });

    it("購入商品が空の場合は例外を投げる", async () => {
      await expect(service.purchase(1, [])).rejects.toThrow(
        "購入する商品がありません。",
      );

      expect(productRepositoryMock.purchase).not.toHaveBeenCalled();
    });

    describe("購入商品の入力チェック", () => {
      it.each([
        {
          title: "商品UUIDが空文字",
          items: [
            {
              productUuid: "",
              quantity: 1,
            },
          ],
        },
        {
          title: "商品UUIDがundefined",
          items: [
            {
              productUuid: undefined as unknown as string,
              quantity: 1,
            },
          ],
        },
        {
          title: "数量が0",
          items: [
            {
              productUuid: "product-uuid-001",
              quantity: 0,
            },
          ],
        },
        {
          title: "数量が負数",
          items: [
            {
              productUuid: "product-uuid-001",
              quantity: -1,
            },
          ],
        },
        {
          title: "数量が小数",
          items: [
            {
              productUuid: "product-uuid-001",
              quantity: 1.5,
            },
          ],
        },
        {
          title: "数量がNaN",
          items: [
            {
              productUuid: "product-uuid-001",
              quantity: Number.NaN,
            },
          ],
        },
      ])("$titleの場合は例外を投げる", async ({ items }) => {
        await expect(service.purchase(1, items)).rejects.toThrow(
          "購入商品の内容が不正です。",
        );

        expect(productRepositoryMock.purchase).not.toHaveBeenCalled();
      });
    });

    it("複数商品のうち1件でも不正な場合はRepositoryを呼び出さない", async () => {
      const items = [
        {
          productUuid: "product-uuid-001",
          quantity: 1,
        },
        {
          productUuid: "product-uuid-002",
          quantity: 0,
        },
      ];

      await expect(service.purchase(1, items)).rejects.toThrow(
        "購入商品の内容が不正です。",
      );

      expect(productRepositoryMock.purchase).not.toHaveBeenCalled();
    });

    it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
      productRepositoryMock.purchase.mockRejectedValue(
        new Error("商品の購入に失敗しました。"),
      );

      await expect(service.purchase(1, validItems)).rejects.toThrow(
        "商品の購入に失敗しました。",
      );

      expect(productRepositoryMock.purchase).toHaveBeenCalledTimes(1);

      expect(productRepositoryMock.purchase).toHaveBeenCalledWith(
        1,
        validItems,
      );
    });
  });
});
