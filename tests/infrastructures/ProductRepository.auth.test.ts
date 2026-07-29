import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductRepository } from "@/infrastructures/ProductRepository";

import type { ICustomerAuthService } from "@/interfaces/ICustomerAuthService";

const PURCHASE_ITEMS = [
  {
    productUuid: "10000000-0000-0000-0000-000000000002",
    quantity: 2,
  },
];

const createAuthService = (accessToken: string | null) => {
  const getAccessToken = vi.fn<() => string | null>(() => accessToken);
  const clearAuthentication = vi.fn<() => void>();

  return {
    service: {
      getAccessToken,
      clearAuthentication,
    } as unknown as ICustomerAuthService,
    getAccessToken,
    clearAuthentication,
  };
};

describe("ProductRepository 購入確定の顧客JWT認証", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("購入確定APIへBearer JWTを付ける", async () => {
    const { service, getAccessToken } = createAuthService("customer-jwt");
    const repository = new ProductRepository(service);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 201,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await repository.purchase(1, PURCHASE_ITEMS);

    expect(getAccessToken).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "/ec-proxy-api/purchase/complete",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer customer-jwt",
        },
      }),
    );
  });

  it("JWTがなければ購入確定APIを呼ばない", async () => {
    const { service, clearAuthentication } = createAuthService(null);
    const repository = new ProductRepository(service);
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    await expect(repository.purchase(1, PURCHASE_ITEMS)).rejects.toThrow(
      "購入するにはログインが必要です。",
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(clearAuthentication).toHaveBeenCalledOnce();
  });

  it("購入確定APIの401で保存済み認証情報を削除する", async () => {
    const { service, clearAuthentication } = createAuthService("expired-jwt");
    const repository = new ProductRepository(service);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 401,
        }),
      ),
    );

    await expect(repository.purchase(1, PURCHASE_ITEMS)).rejects.toThrow(
      "購入するにはログインが必要です。",
    );

    expect(clearAuthentication).toHaveBeenCalledOnce();
  });
});
