import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";

import { OrderService } from "@/services/OrderService";

import type { IOrderRepository } from "@/interfaces/IOrderRepository";

import type { Orders } from "@/models/Orders";

import type { SearchOrdersResponse } from "@/models/SearchOrdersResponse";

describe("OrderService", () => {
  let service: OrderService;

  /*
   * IOrderRepositoryの各メソッドを
   * Vitestのモックとして扱う。
   *
   * 実際のOrderRepositoryやfetchは使用しない。
   */
  let orderRepositoryMock: Mocked<IOrderRepository>;

  beforeEach(() => {
    /*
     * Repositoryの各メソッドを
     * vi.fn()で完全にモック化する。
     */
    orderRepositoryMock = {
      findPurchaseHistory: vi.fn(),

      findById: vi.fn(),
    };

    /*
     * モックRepositoryをServiceへ注入する。
     */
    service = new OrderService(orderRepositoryMock);
  });

  describe("findPurchaseHistory", () => {
    it("Repositoryから取得した購入履歴一覧を返す", async () => {
      const expectedResponse: SearchOrdersResponse = {
        title: "購入履歴",

        orderList: [
          {
            orderUuid: "order-uuid-001",

            orderDate: "2026-07-28T10:00:00Z",

            orderStatus: "注文受付",

            totalPrice: 3000,

            detailUrl: "/purchase/history/order-uuid-001",
          },
          {
            orderUuid: "order-uuid-002",

            orderDate: "2026-07-27T09:00:00Z",

            orderStatus: "発送済み",

            totalPrice: 5000,

            detailUrl: "/purchase/history/order-uuid-002",
          },
        ],

        message: null,
      };

      /*
       * Repositoryが返す購入履歴一覧を設定する。
       */
      orderRepositoryMock.findPurchaseHistory.mockResolvedValue(
        expectedResponse,
      );

      const result = await service.findPurchaseHistory();

      /*
       * ServiceがRepositoryを
       * 1回呼んだことを確認する。
       */
      expect(orderRepositoryMock.findPurchaseHistory).toHaveBeenCalledTimes(1);

      /*
       * 引数なしで呼ばれたことを確認する。
       */
      expect(orderRepositoryMock.findPurchaseHistory).toHaveBeenCalledWith();

      /*
       * Repositoryの戻り値を
       * Serviceがそのまま返すことを確認する。
       */
      expect(result).toEqual(expectedResponse);
    });

    it("購入履歴がない場合もRepositoryの結果をそのまま返す", async () => {
      const expectedResponse: SearchOrdersResponse = {
        title: "購入履歴",

        orderList: [],

        message: "購入履歴はありません。",
      };

      orderRepositoryMock.findPurchaseHistory.mockResolvedValue(
        expectedResponse,
      );

      const result = await service.findPurchaseHistory();

      expect(result).toEqual(expectedResponse);

      expect(orderRepositoryMock.findPurchaseHistory).toHaveBeenCalledTimes(1);
    });

    it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
      orderRepositoryMock.findPurchaseHistory.mockRejectedValue(
        new Error("購入履歴の取得に失敗しました。"),
      );

      await expect(service.findPurchaseHistory()).rejects.toThrow(
        "購入履歴の取得に失敗しました。",
      );

      expect(orderRepositoryMock.findPurchaseHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    it("Repositoryへ注文UUIDを渡して購入履歴詳細を返す", async () => {
      const expectedOrder: Orders = {
        orderUuid: "order-uuid-001",

        orderDate: "2026-07-28T10:00:00Z",

        amountTotal: 3500,

        orderStatus: {
          id: 2,

          name: "発送準備中",
        },

        ordersDetails: [
          {
            id: 1,

            product: {
              productUuid: "product-uuid-001",

              name: "商品A",

              price: 1000,

              imageUrl: null,

              productCategory: null,

              productStock: null,

              deleteFlg: 0,
            },

            count: 2,

            price: 1000,

            subtotal: 2000,
          },
          {
            id: 2,

            product: {
              productUuid: "product-uuid-002",

              name: "商品B",

              price: 1500,

              imageUrl: null,

              productCategory: null,

              productStock: null,

              deleteFlg: 0,
            },

            count: 1,

            price: 1500,

            subtotal: 1500,
          },
        ],
      };

      /*
       * Repositoryが返す注文詳細を設定する。
       */
      orderRepositoryMock.findById.mockResolvedValue(expectedOrder);

      const result = await service.findById("order-uuid-001");

      /*
       * Serviceが受け取った注文UUIDを
       * Repositoryへそのまま渡すことを確認する。
       */
      expect(orderRepositoryMock.findById).toHaveBeenCalledTimes(1);

      expect(orderRepositoryMock.findById).toHaveBeenCalledWith(
        "order-uuid-001",
      );

      /*
       * Repositoryの戻り値を
       * Serviceがそのまま返すことを確認する。
       */
      expect(result).toEqual(expectedOrder);
    });

    it("空の商品明細を含む注文詳細もそのまま返す", async () => {
      const expectedOrder: Orders = {
        orderUuid: "order-uuid-002",

        orderDate: "2026-07-27T09:00:00Z",

        amountTotal: 0,

        orderStatus: {
          id: 1,

          name: "注文受付",
        },

        ordersDetails: [],
      };

      orderRepositoryMock.findById.mockResolvedValue(expectedOrder);

      const result = await service.findById("order-uuid-002");

      expect(result).toEqual(expectedOrder);

      expect(orderRepositoryMock.findById).toHaveBeenCalledWith(
        "order-uuid-002",
      );
    });

    it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
      orderRepositoryMock.findById.mockRejectedValue(
        new Error("指定された購入履歴が見つかりませんでした。"),
      );

      await expect(service.findById("not-found-order")).rejects.toThrow(
        "指定された購入履歴が見つかりませんでした。",
      );

      expect(orderRepositoryMock.findById).toHaveBeenCalledTimes(1);

      expect(orderRepositoryMock.findById).toHaveBeenCalledWith(
        "not-found-order",
      );
    });
  });
});
