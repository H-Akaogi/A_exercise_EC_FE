import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ICustomerAuthRepository } from "@/interfaces/ICustomerAuthRepository";

import type { ICustomerAuthSessionStore } from "@/interfaces/ICustomerAuthSessionStore";

import { CustomerLoginValidationError } from "@/models/CustomerAuth";

import { CustomerAuthService } from "@/services/CustomerAuthService";

describe("CustomerAuthService", () => {
  let repository: ICustomerAuthRepository;
  let sessionStore: ICustomerAuthSessionStore;
  let service: CustomerAuthService;

  const futureSession = {
    accessToken: "customer-jwt",
    expiresAt: "2099-07-27T12:30:00.000Z",
    username: "andoTaro",
  };

  beforeEach(() => {
    repository = {
      login: vi.fn().mockResolvedValue(futureSession),
      logout: vi.fn().mockResolvedValue({
        loggedOut: true,
      }),
    };

    sessionStore = {
      save: vi.fn(),
      getValidSession: vi.fn().mockReturnValue(futureSession),
      clear: vi.fn(),
    };

    service = new CustomerAuthService(repository, sessionStore);
  });

  describe("login", () => {
    it("認証成功時にJWTと有効期限を保存する", async () => {
      const request = {
        mailAddress: "ando.taro@example.com",
        password: "Test12345",
      };

      await expect(service.login(request)).resolves.toEqual({
        isAuthenticated: true,
        expiresAt: futureSession.expiresAt,
        username: futureSession.username,
      });

      expect(repository.login).toHaveBeenCalledOnce();
      expect(repository.login).toHaveBeenCalledWith(request);
      expect(sessionStore.save).toHaveBeenCalledWith(futureSession);
    });

    it("usernameがない正式応答では表示名をnullにする", async () => {
      const response = {
        accessToken: "customer-jwt",
        expiresAt: "2099-07-27T12:30:00.000Z",
      };

      vi.mocked(repository.login).mockResolvedValue(response);

      await expect(
        service.login({
          mailAddress: "ando.taro@example.com",
          password: "Test12345",
        }),
      ).resolves.toEqual({
        isAuthenticated: true,
        expiresAt: response.expiresAt,
        username: null,
      });

      expect(sessionStore.save).toHaveBeenCalledWith(response);
    });

    it.each(["12345", "12345678901234567890"])(
      "パスワード境界値「%s」を許可する",
      async (password) => {
        await service.login({
          mailAddress: "ando.taro@example.com",
          password,
        });

        expect(repository.login).toHaveBeenCalledOnce();
      },
    );

    it.each(["1234", "123456789012345678901"])(
      "パスワード境界外「%s」を拒否する",
      async (password) => {
        await expect(
          service.login({
            mailAddress: "ando.taro@example.com",
            password,
          }),
        ).rejects.toMatchObject({
          fieldErrors: {
            password: "パスワードは5～20文字で入力してください。",
          },
        });

        expect(repository.login).not.toHaveBeenCalled();
      },
    );

    it("必須入力エラーを項目別に返す", async () => {
      await expect(
        service.login({
          mailAddress: "",
          password: "",
        }),
      ).rejects.toMatchObject({
        fieldErrors: {
          mailAddress: "メールアドレスを入力してください。",
          password: "パスワードを入力してください。",
        },
      });

      expect(repository.login).not.toHaveBeenCalled();
    });

    it("メールアドレス形式エラーを返す", async () => {
      try {
        await service.login({
          mailAddress: "invalid-address",
          password: "Test12345",
        });

        expect.fail("入力値エラーになるべきです。");
      } catch (error) {
        expect(error).toBeInstanceOf(CustomerLoginValidationError);
        expect(
          (error as CustomerLoginValidationError).fieldErrors.mailAddress,
        ).toBe("正しいメールアドレス形式で入力してください。");
      }
    });
  });

  describe("logout", () => {
    it("有効なJWTでAPIを呼び認証情報を削除する", async () => {
      await service.logout();

      expect(repository.logout).toHaveBeenCalledWith("customer-jwt");
      expect(sessionStore.clear).toHaveBeenCalledOnce();
    });

    it("JWTがなければAPIを呼ばず認証情報を削除する", async () => {
      vi.mocked(sessionStore.getValidSession).mockReturnValue(null);

      await service.logout();

      expect(repository.logout).not.toHaveBeenCalled();
      expect(sessionStore.clear).toHaveBeenCalledOnce();
    });

    it("ログアウトAPIが失敗しても認証情報を削除する", async () => {
      vi.mocked(repository.logout).mockRejectedValue(
        new Error("システムエラーが発生しました。"),
      );

      await expect(service.logout()).rejects.toThrow(
        "システムエラーが発生しました。",
      );
      expect(sessionStore.clear).toHaveBeenCalledOnce();
    });
  });

  it("有効な保存情報から認証状態とJWTを返す", () => {
    expect(service.getAuthState()).toEqual({
      isAuthenticated: true,
      expiresAt: futureSession.expiresAt,
      username: futureSession.username,
    });
    expect(service.getAccessToken()).toBe("customer-jwt");
  });

  it("期限切れ等で保存情報がなければ未認証扱いにする", () => {
    vi.mocked(sessionStore.getValidSession).mockReturnValue(null);

    expect(service.getAuthState()).toEqual({
      isAuthenticated: false,
      expiresAt: null,
      username: null,
    });
    expect(service.getAccessToken()).toBeNull();
  });

  it("認証情報削除を購読中のUIへ通知する", () => {
    const listener = vi.fn();
    const unsubscribe = service.subscribeToAuthenticationCleared(listener);

    service.clearAuthentication();

    expect(sessionStore.clear).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    service.clearAuthentication();

    expect(listener).toHaveBeenCalledOnce();
  });
});
