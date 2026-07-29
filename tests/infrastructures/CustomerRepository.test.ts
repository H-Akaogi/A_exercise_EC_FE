import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CustomerRepository } from "@/infrastructures/CustomerRepository";
import type { Customer } from "@/models/Customer";

describe("CustomerRepository", () => {
  let repository: CustomerRepository;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repository = new CustomerRepository();

    fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    /*
     * リポジトリ内のエラーログを
     * テスト結果へ表示させない。
     */
    vi.spyOn(console, "log").mockImplementation(() => undefined);

    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("getForm", () => {
    it("顧客登録フォームの初期情報を取得できる", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          title: "顧客登録",
          model: {
            name: "山田太郎",
            kana: "ヤマダタロウ",
            address1: "東京都新宿区",
            address2: "新宿ビル101",
            phoneNumber: "09012345678",
            mailAddress: "taro@example.com",
            username: "taro-user",
            password: "password123",
          },
        }),
      });

      const result = await repository.getForm();

      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(fetchMock).toHaveBeenCalledWith("/proxy-api/account/form", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      expect(result).toEqual({
        title: "顧客登録",
        model: {
          customerUuid: "",
          name: "山田太郎",
          kana: "ヤマダタロウ",
          address1: "東京都新宿区",
          address2: "新宿ビル101",
          phoneNumber: "09012345678",
          mailAddress: "taro@example.com",
          username: "taro-user",
          password: "password123",
          createdAt: "",
        },
      });
    });

    it("住所2がnullでも取得できる", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          title: "顧客登録",
          model: {
            name: "",
            kana: "",
            address1: "",
            address2: null,
            phoneNumber: "",
            mailAddress: "",
            username: "",
            password: "",
          },
        }),
      });

      const result = await repository.getForm();

      expect(result.model.address2).toBeNull();
    });

    it("APIエラーのerrorsをまとめて例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          errors: {
            Name: ["氏名は必須です。", "氏名を確認してください。"],
            MailAddress: "メールアドレスが不正です。",
          },
        }),
      });

      await expect(repository.getForm()).rejects.toThrow(
        [
          "氏名は必須です。",
          "氏名を確認してください。",
          "メールアドレスが不正です。",
        ].join("\n"),
      );
    });

    it("APIエラーのmessageを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          message: "顧客情報を取得できませんでした。",
        }),
      });

      await expect(repository.getForm()).rejects.toThrow(
        "顧客情報を取得できませんでした。",
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

      await expect(repository.getForm()).rejects.toThrow(
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

      await expect(repository.getForm()).rejects.toThrow(
        "Internal Server Error",
      );
    });

    it("エラー本文を取得できない場合はステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
        json: vi.fn().mockRejectedValue(new Error("JSON parse error")),
      });

      await expect(repository.getForm()).rejects.toThrow(
        "顧客登録画面の初期情報取得に失敗しました (Status: 503)",
      );
    });
  });

  describe("existsByAccountName", () => {
    it("409の場合はアカウント名が存在すると判定する", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 409,
        json: vi.fn(),
      });

      const result = await repository.existsByAccountName("test user");

      expect(fetchMock).toHaveBeenCalledWith(
        "/proxy-api/account/validate/username?username=test+user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      expect(result).toBe(true);
    });

    it("レスポンスのexistsがtrueの場合はtrueを返す", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          exists: true,
        }),
      });

      const result = await repository.existsByAccountName("existing-user");

      expect(result).toBe(true);
    });

    it("レスポンスのexistsがfalseの場合はfalseを返す", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          exists: false,
        }),
      });

      const result = await repository.existsByAccountName("available-user");

      expect(result).toBe(false);
    });

    it("existsがない場合はfalseを返す", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          message: "使用可能です。",
        }),
      });

      const result = await repository.existsByAccountName("available-user");

      expect(result).toBe(false);
    });

    it("APIエラーのmessageを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          message: "アカウント名が不正です。",
        }),
      });

      await expect(
        repository.existsByAccountName("invalid-user"),
      ).rejects.toThrow("アカウント名が不正です。");
    });

    it("APIエラーのerrorsをまとめて例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          errors: {
            Username: [
              "アカウント名は必須です。",
              "5文字以上入力してください。",
            ],
          },
        }),
      });

      await expect(repository.existsByAccountName("")).rejects.toThrow(
        ["アカウント名は必須です。", "5文字以上入力してください。"].join("\n"),
      );
    });

    it("エラー情報がない場合はステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      });

      await expect(repository.existsByAccountName("test-user")).rejects.toThrow(
        "アカウント名の確認に失敗しました (Status: 500)",
      );
    });

    it("エラー本文を取得できない場合もステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockRejectedValue(new Error("JSON parse error")),
      });

      await expect(repository.existsByAccountName("test-user")).rejects.toThrow(
        "アカウント名の確認に失敗しました (Status: 502)",
      );
    });
  });

  describe("existsByMail", () => {
    it("409の場合はメールアドレスが存在すると判定する", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 409,
        json: vi.fn(),
      });

      const result = await repository.existsByMail("test+sample@example.com");

      expect(fetchMock).toHaveBeenCalledWith(
        "/proxy-api/account/validate/mail-address?mailAddress=test%2Bsample%40example.com",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      expect(result).toBe(true);
    });

    it("レスポンスのexistsがtrueの場合はtrueを返す", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          exists: true,
        }),
      });

      const result = await repository.existsByMail("existing@example.com");

      expect(result).toBe(true);
    });

    it("レスポンスのexistsがfalseの場合はfalseを返す", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          exists: false,
        }),
      });

      const result = await repository.existsByMail("available@example.com");

      expect(result).toBe(false);
    });

    it("existsがない場合はfalseを返す", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          message: "使用可能です。",
        }),
      });

      const result = await repository.existsByMail("available@example.com");

      expect(result).toBe(false);
    });

    it("APIエラーのmessageを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          message: "メールアドレスが不正です。",
        }),
      });

      await expect(repository.existsByMail("invalid-mail")).rejects.toThrow(
        "メールアドレスが不正です。",
      );
    });

    it("APIエラーのerrorsをまとめて例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          errors: {
            MailAddress: [
              "メールアドレスは必須です。",
              "形式が正しくありません。",
            ],
          },
        }),
      });

      await expect(repository.existsByMail("")).rejects.toThrow(
        ["メールアドレスは必須です。", "形式が正しくありません。"].join("\n"),
      );
    });

    it("エラー情報がない場合はステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      });

      await expect(repository.existsByMail("test@example.com")).rejects.toThrow(
        "メールアドレスの確認に失敗しました (Status: 500)",
      );
    });

    it("エラー本文を取得できない場合もステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockRejectedValue(new Error("JSON parse error")),
      });

      await expect(repository.existsByMail("test@example.com")).rejects.toThrow(
        "メールアドレスの確認に失敗しました (Status: 502)",
      );
    });
  });

  describe("create", () => {
    const customer: Customer = {
      customerUuid: "customer-uuid",
      name: "山田太郎",
      kana: "ヤマダタロウ",
      address1: "東京都新宿区",
      address2: "新宿ビル101",
      phoneNumber: "09012345678",
      mailAddress: "taro@example.com",
      username: "taro-user",
      password: "password123",
      createdAt: "2026-07-28T00:00:00Z",
    };

    it("顧客アカウントを登録できる", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          title: "顧客登録完了",
          message: "顧客アカウントを登録しました。",
          customerUuid: "created-customer-uuid",
          name: "山田太郎",
          username: "taro-user",
          createdAt: "2026-07-28T02:00:00Z",
        }),
      });

      const result = await repository.create(customer);

      expect(fetchMock).toHaveBeenCalledWith("/proxy-api/account/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: customer.name,
          kana: customer.kana,
          address1: customer.address1,
          address2: customer.address2,
          phoneNumber: customer.phoneNumber,
          mailAddress: customer.mailAddress,
          username: customer.username,
          password: customer.password,
        }),
      });

      expect(result).toEqual({
        title: "顧客登録完了",
        message: "顧客アカウントを登録しました。",
        customerUuid: "created-customer-uuid",
        name: "山田太郎",
        username: "taro-user",
        createdAt: "2026-07-28T02:00:00Z",
      });
    });

    it("レスポンスに省略された値は顧客情報または空文字で補完する", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          message: "登録しました。",
          customerUuid: "created-customer-uuid",
        }),
      });

      const result = await repository.create(customer);

      expect(result).toEqual({
        title: "",
        message: "登録しました。",
        customerUuid: "created-customer-uuid",
        name: customer.name,
        username: customer.username,
        createdAt: "",
      });
    });

    it("APIエラーのmessageを例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          message: "顧客アカウントを登録できませんでした。",
        }),
      });

      await expect(repository.create(customer)).rejects.toThrow(
        "顧客アカウントを登録できませんでした。",
      );
    });

    it("配列形式のバリデーションエラーを整形して例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          errors: {
            Name: ["氏名は必須です。", "氏名が長すぎます。"],
            MailAddress: ["メールアドレスが不正です。"],
          },
        }),
      });

      const error = await repository
        .create(customer)
        .catch((caughtError: unknown) => caughtError);

      expect(error).toBeInstanceOf(Error);

      const parsed = JSON.parse((error as Error).message);

      expect(parsed).toEqual({
        type: "validation",
        errors: {
          name: "氏名は必須です。",
          mailAddress: "メールアドレスが不正です。",
        },
      });
    });

    it("文字列形式のバリデーションエラーを整形して例外として投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          errors: {
            Username: "アカウント名が既に使用されています。",
            Address1: "住所を入力してください。",
          },
        }),
      });

      const error = await repository
        .create(customer)
        .catch((caughtError: unknown) => caughtError);

      expect(error).toBeInstanceOf(Error);

      const parsed = JSON.parse((error as Error).message);

      expect(parsed).toEqual({
        type: "validation",
        errors: {
          username: "アカウント名が既に使用されています。",
          address1: "住所を入力してください。",
        },
      });
    });

    it("エラー情報がない場合はステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      });

      await expect(repository.create(customer)).rejects.toThrow(
        "担当者アカウントの登録に失敗しました (Status: 500)",
      );
    });

    it("エラー本文を取得できない場合もステータス付きの例外を投げる", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
        json: vi.fn().mockRejectedValue(new Error("JSON parse error")),
      });

      await expect(repository.create(customer)).rejects.toThrow(
        "担当者アカウントの登録に失敗しました (Status: 503)",
      );
    });
  });
});
