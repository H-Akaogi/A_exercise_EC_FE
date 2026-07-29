import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PaymentMethodRepository } from "@/infrastructures/PaymentMethodRepository";

describe("PaymentMethodRepository", () => {
  let repository: PaymentMethodRepository;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repository = new PaymentMethodRepository();

    fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("findAll", () => {
    it("支払方法一覧を取得してPaymentMethodへ変換できる", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([
          {
            value: "1",
            label: "クレジットカード",
          },
          {
            value: "2",
            label: "銀行振込",
          },
          {
            value: "3",
            label: "代金引換",
          },
        ]),
      });

      const result = await repository.findAll();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(fetchMock).toHaveBeenCalledWith(
        "/proxy-api/payment-method/options",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
          cache: "no-store",
        },
      );

      expect(result).toEqual([
        {
          id: 1,
          name: "クレジットカード",
        },
        {
          id: 2,
          name: "銀行振込",
        },
        {
          id: 3,
          name: "代金引換",
        },
      ]);
    });

    it("支払方法がない場合は空配列を返す", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([]),
      });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it("valueを数値へ変換する", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([
          {
            value: "10",
            label: "後払い",
          },
        ]),
      });

      const result = await repository.findAll();

      expect(result[0]).toEqual({
        id: 10,
        name: "後払い",
      });

      expect(typeof result[0].id).toBe("number");
    });

    it("APIエラーのmessageを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          message: "支払方法を取得できませんでした。",
        }),
      });

      await expect(repository.findAll()).rejects.toThrow(
        "支払方法を取得できませんでした。",
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

      await expect(repository.findAll()).rejects.toThrow(
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

      await expect(repository.findAll()).rejects.toThrow(
        "Internal Server Error",
      );
    });

    it("エラー情報がない場合はステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
        json: vi.fn().mockResolvedValue({}),
      });

      await expect(repository.findAll()).rejects.toThrow(
        "カテゴリ一覧の取得に失敗しました (Status: 503)",
      );
    });

    it("エラー本文をJSONとして取得できない場合もステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockRejectedValue(new Error("JSON parse error")),
      });

      await expect(repository.findAll()).rejects.toThrow(
        "カテゴリ一覧の取得に失敗しました (Status: 502)",
      );
    });
  });
});
