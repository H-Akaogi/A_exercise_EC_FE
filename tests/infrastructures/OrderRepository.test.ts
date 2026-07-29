import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OrderRepository } from "@/infrastructures/OrderRepository";
import type { ICustomerAuthService } from "@/interfaces/ICustomerAuthService";

describe("OrderRepository", () => {
  let repository: OrderRepository;

  let customerAuthServiceMock: {
    getAccessToken: ReturnType<typeof vi.fn>;
    clearAuthentication: ReturnType<typeof vi.fn>;
  };

  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    customerAuthServiceMock = {
      getAccessToken: vi.fn(),
      clearAuthentication: vi.fn(),
    };

    repository = new OrderRepository(
      customerAuthServiceMock as unknown as ICustomerAuthService,
    );

    fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    /*
     * APIエラー時のログを
     * テスト結果へ表示しない。
     */
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("findPurchaseHistory", () => {
    it("アクセストークン付きで購入履歴を取得できる", async () => {
      customerAuthServiceMock.getAccessToken.mockReturnValue(
        "customer-access-token",
      );

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
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
        }),
      });

      const result = await repository.findPurchaseHistory();

      expect(customerAuthServiceMock.getAccessToken).toHaveBeenCalledTimes(1);

      expect(fetchMock).toHaveBeenCalledWith("/ec-proxy-api/purchase/history", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer customer-access-token",
        },
        credentials: "include",
        cache: "no-store",
      });

      expect(result).toEqual({
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
      });
    });

    it("アクセストークンがない場合はAuthorizationヘッダーを付けない", async () => {
      customerAuthServiceMock.getAccessToken.mockReturnValue(null);

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          orderList: [],
          message: "購入履歴はありません。",
        }),
      });

      const result = await repository.findPurchaseHistory();

      expect(fetchMock).toHaveBeenCalledWith("/ec-proxy-api/purchase/history", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      expect(result).toEqual({
        title: "購入履歴",
        orderList: [],
        message: "購入履歴はありません。",
      });
    });

    it("401の場合は認証情報を削除して例外を投げる", async () => {
      customerAuthServiceMock.getAccessToken.mockReturnValue("expired-token");

      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        json: vi.fn(),
      });

      await expect(repository.findPurchaseHistory()).rejects.toThrow(
        "購入履歴を確認するにはログインが必要です",
      );

      expect(customerAuthServiceMock.clearAuthentication).toHaveBeenCalledTimes(
        1,
      );
    });

    it("errorsがある場合はすべてのメッセージを結合して例外を投げる", async () => {
      customerAuthServiceMock.getAccessToken.mockReturnValue(
        "customer-access-token",
      );

      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          errors: {
            Customer: [
              "顧客情報が取得できません。",
              "再度ログインしてください。",
            ],
            Order: "注文情報が不正です。",
          },
        }),
      });

      await expect(repository.findPurchaseHistory()).rejects.toThrow(
        [
          "顧客情報が取得できません。",
          "再度ログインしてください。",
          "注文情報が不正です。",
        ].join("\n"),
      );
    });

    it("messageがある場合はmessageを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          message: "購入履歴を取得できませんでした。",
        }),
      });

      await expect(repository.findPurchaseHistory()).rejects.toThrow(
        "購入履歴を取得できませんでした。",
      );
    });

    it("messageがない場合はdetailを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          detail: "サーバー内部でエラーが発生しました。",
        }),
      });

      await expect(repository.findPurchaseHistory()).rejects.toThrow(
        "サーバー内部でエラーが発生しました。",
      );
    });

    it("messageとdetailがない場合はtitleを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          title: "Internal Server Error",
        }),
      });

      await expect(repository.findPurchaseHistory()).rejects.toThrow(
        "Internal Server Error",
      );
    });

    it("エラー本文に情報がない場合はステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
        json: vi.fn().mockResolvedValue({}),
      });

      await expect(repository.findPurchaseHistory()).rejects.toThrow(
        "購入履歴の取得に失敗しました (Status: 503)",
      );
    });

    it("エラー本文をJSONとして取得できない場合もステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockRejectedValue(new Error("JSON parse error")),
      });

      await expect(repository.findPurchaseHistory()).rejects.toThrow(
        "購入履歴の取得に失敗しました (Status: 502)",
      );
    });
  });

  describe("findById", () => {
    it("アクセストークン付きで購入履歴詳細を取得できる", async () => {
      customerAuthServiceMock.getAccessToken.mockReturnValue(
        "customer-access-token",
      );

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          orderUuid: "order-uuid-001",
          orderDate: "2026-07-28T10:00:00Z",
          orderStatusId: 2,
          orderStatusName: "発送準備中",
          orderItems: [
            {
              productUuid: "product-uuid-001",
              productName: "商品A",
              price: 1000,
              quantity: 2,
              subtotal: 2000,
            },
            {
              productUuid: "product-uuid-002",
              productName: "商品B",
              price: 1500,
              quantity: 1,
              subtotal: 1500,
            },
          ],
          totalPrice: 3500,
        }),
      });

      const result = await repository.findById("order uuid/001");

      expect(fetchMock).toHaveBeenCalledWith(
        "/ec-proxy-api/purchase/history/order%20uuid%2F001",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer customer-access-token",
          },
          credentials: "include",
          cache: "no-store",
        },
      );

      expect(result).toEqual({
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
      });
    });

    it("アクセストークンがない場合はAuthorizationヘッダーを付けない", async () => {
      customerAuthServiceMock.getAccessToken.mockReturnValue(undefined);

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          orderUuid: "order-uuid-001",
          orderDate: "2026-07-28T10:00:00Z",
          orderStatusId: 1,
          orderStatusName: "注文受付",
          orderItems: [],
          totalPrice: 0,
        }),
      });

      await repository.findById("order-uuid-001");

      expect(fetchMock).toHaveBeenCalledWith(
        "/ec-proxy-api/purchase/history/order-uuid-001",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
          cache: "no-store",
        },
      );
    });

    it("401の場合は認証情報を削除して例外を投げる", async () => {
      customerAuthServiceMock.getAccessToken.mockReturnValue("expired-token");

      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        json: vi.fn(),
      });

      await expect(repository.findById("order-uuid-001")).rejects.toThrow(
        "購入履歴の詳細を確認するにはログインが必要です",
      );

      expect(customerAuthServiceMock.clearAuthentication).toHaveBeenCalledTimes(
        1,
      );
    });

    it("404の場合は購入履歴が見つからない例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn(),
      });

      await expect(repository.findById("not-found-order")).rejects.toThrow(
        "指定された購入履歴が見つかりませんでした",
      );

      expect(
        customerAuthServiceMock.clearAuthentication,
      ).not.toHaveBeenCalled();
    });

    it("errorsがある場合はすべてのメッセージを結合して例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          errors: {
            OrderUuid: ["注文UUIDが不正です。", "注文UUIDを確認してください。"],
            Customer: "顧客情報が不正です。",
          },
        }),
      });

      await expect(repository.findById("invalid-order")).rejects.toThrow(
        [
          "注文UUIDが不正です。",
          "注文UUIDを確認してください。",
          "顧客情報が不正です。",
        ].join("\n"),
      );
    });

    it("messageがある場合はmessageを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          message: "購入履歴詳細を取得できませんでした。",
        }),
      });

      await expect(repository.findById("order-uuid-001")).rejects.toThrow(
        "購入履歴詳細を取得できませんでした。",
      );
    });

    it("messageがない場合はdetailを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          detail: "注文詳細の取得処理でエラーが発生しました。",
        }),
      });

      await expect(repository.findById("order-uuid-001")).rejects.toThrow(
        "注文詳細の取得処理でエラーが発生しました。",
      );
    });

    it("messageとdetailがない場合はtitleを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          title: "Internal Server Error",
        }),
      });

      await expect(repository.findById("order-uuid-001")).rejects.toThrow(
        "Internal Server Error",
      );
    });

    it("エラー本文に情報がない場合はステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
        json: vi.fn().mockResolvedValue({}),
      });

      await expect(repository.findById("order-uuid-001")).rejects.toThrow(
        "購入履歴詳細の取得に失敗しました (Status: 503)",
      );
    });

    it("エラー本文をJSONとして取得できない場合もステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockRejectedValue(new Error("JSON parse error")),
      });

      await expect(repository.findById("order-uuid-001")).rejects.toThrow(
        "購入履歴詳細の取得に失敗しました (Status: 502)",
      );
    });
  });
});
