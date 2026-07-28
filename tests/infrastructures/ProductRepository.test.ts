import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { ProductRepository } from "@/infrastructures/ProductRepository";
import type { ICustomerAuthService } from "@/interfaces/ICustomerAuthService";

describe("ProductRepository", () => {
    let repository: ProductRepository;
    let fetchMock: ReturnType<typeof vi.fn>;

    let customerAuthServiceMock: {
        getAccessToken: ReturnType<typeof vi.fn>;
        clearAuthentication: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        customerAuthServiceMock = {
            getAccessToken: vi.fn(),
            clearAuthentication: vi.fn(),
        };

        repository = new ProductRepository(
            customerAuthServiceMock as unknown as ICustomerAuthService,
        );

        fetchMock = vi.fn();

        vi.stubGlobal(
            "fetch",
            fetchMock,
        );

        vi.spyOn(
            console,
            "error",
        ).mockImplementation(
            () => undefined,
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe("findByCategory", () => {
        it("カテゴリUUIDを指定して商品一覧を取得できる", async () => {
            const products = [
                {
                    productUuid:
                        "product-uuid-001",
                    name:
                        "商品A",
                    price:
                        1000,
                },
                {
                    productUuid:
                        "product-uuid-002",
                    name:
                        "商品B",
                    price:
                        2000,
                },
            ];

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(
                    products,
                ),
            });

            const result =
                await repository.findByCategory(
                    "category uuid/001",
                );

            expect(fetchMock).toHaveBeenCalledWith(
                "/proxy-api/product/search?productCategoryUuid=category+uuid%2F001",
                {
                    method:
                        "GET",
                    headers: {
                        Accept:
                            "application/json",
                    },
                    credentials:
                        "include",
                    cache:
                        "no-store",
                },
            );

            expect(result).toEqual(
                products,
            );
        });

        it("カテゴリUUIDが未指定の場合はクエリなしで全件取得する", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(
                    [],
                ),
            });

            const result =
                await repository.findByCategory();

            expect(fetchMock).toHaveBeenCalledWith(
                "/proxy-api/product/search",
                {
                    method:
                        "GET",
                    headers: {
                        Accept:
                            "application/json",
                    },
                    credentials:
                        "include",
                    cache:
                        "no-store",
                },
            );

            expect(result).toEqual([]);
        });

        it("カテゴリUUIDが空文字の場合はクエリなしで全件取得する", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(
                    [],
                ),
            });

            await repository.findByCategory(
                "",
            );

            expect(fetchMock).toHaveBeenCalledWith(
                "/proxy-api/product/search",
                expect.any(Object),
            );
        });

        it("カテゴリUUIDが空白のみの場合はクエリなしで全件取得する", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(
                    [],
                ),
            });

            await repository.findByCategory(
                "   ",
            );

            expect(fetchMock).toHaveBeenCalledWith(
                "/proxy-api/product/search",
                expect.any(Object),
            );
        });

        it("APIエラーのmessageを例外として投げる", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn().mockResolvedValue({
                    message:
                        "商品を取得できませんでした。",
                }),
            });

            await expect(
                repository.findByCategory(),
            ).rejects.toThrow(
                "商品を取得できませんでした。",
            );
        });

        it("messageがない場合はdetailを例外として投げる", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn().mockResolvedValue({
                    detail:
                        "商品検索処理でエラーが発生しました。",
                }),
            });

            await expect(
                repository.findByCategory(),
            ).rejects.toThrow(
                "商品検索処理でエラーが発生しました。",
            );
        });

        it("messageとdetailがない場合はtitleを例外として投げる", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn().mockResolvedValue({
                    title:
                        "Internal Server Error",
                }),
            });

            await expect(
                repository.findByCategory(),
            ).rejects.toThrow(
                "Internal Server Error",
            );
        });

        it("エラー情報がない場合はステータス付きの例外を投げる", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 503,
                json: vi.fn().mockResolvedValue(
                    {},
                ),
            });

            await expect(
                repository.findByCategory(),
            ).rejects.toThrow(
                "商品一覧の取得に失敗しました (Status: 503)",
            );
        });

        it("エラー本文をJSONとして取得できない場合もステータス付きの例外を投げる", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 502,
                json: vi.fn().mockRejectedValue(
                    new Error(
                        "JSON parse error",
                    ),
                ),
            });

            await expect(
                repository.findByCategory(),
            ).rejects.toThrow(
                "商品一覧の取得に失敗しました (Status: 502)",
            );
        });
    });

    describe("findById", () => {
        it("商品UUIDを指定して商品詳細を取得できる", async () => {
            const productDetail = {
                productUuid:
                    "product-uuid-001",
                name:
                    "商品A",
                price:
                    1000,
                imageUrl:
                    "https://example.com/product.png",
                productCategory: {
                    categoryUuid:
                        "category-uuid-001",
                    name:
                        "食品",
                },
                productStock: {
                    quantity:
                        10,
                },
                deleteFlg:
                    0,
            };

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(
                    productDetail,
                ),
            });

            const result =
                await repository.findById(
                    "product uuid/001",
                );

            expect(fetchMock).toHaveBeenCalledWith(
                "/proxy-api/products/detail/product%20uuid%2F001",
                {
                    method:
                        "GET",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials:
                        "include",
                },
            );

            expect(result).toEqual(
                productDetail,
            );
        });

        it("404の場合はnullを返す", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn(),
            });

            const result =
                await repository.findById(
                    "not-found-product",
                );

            expect(result).toBeNull();
        });

        it("404以外の場合はレスポンスのJSONを返す", async () => {
            const responseData = {
                message:
                    "サーバーエラー",
            };

            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn().mockResolvedValue(
                    responseData,
                ),
            });

            const result =
                await repository.findById(
                    "product-uuid-001",
                );

            expect(result).toEqual(
                responseData,
            );
        });
    });

    describe("purchase", () => {
        const validItems = [
            {
                productUuid:
                    "product-uuid-001",
                quantity:
                    2,
            },
            {
                productUuid:
                    "product-uuid-002",
                quantity:
                    1,
            },
        ];

        it("購入を確定できる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).resolves.toBeUndefined();

            expect(
                customerAuthServiceMock.getAccessToken,
            ).toHaveBeenCalledTimes(1);

            expect(fetchMock).toHaveBeenCalledWith(
                "/proxy-api/purchase/complete",
                {
                    method:
                        "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept:
                            "application/json",
                        Authorization:
                            "Bearer customer-access-token",
                    },
                    credentials:
                        "include",
                    body: JSON.stringify({
                        paymentMethodId:
                            1,
                        items: [
                            {
                                productUuid:
                                    "product-uuid-001",
                                quantity:
                                    2,
                            },
                            {
                                productUuid:
                                    "product-uuid-002",
                                quantity:
                                    1,
                            },
                        ],
                    }),
                },
            );
        });

        it.each([
            {
                paymentMethodId:
                    0,
                title:
                    "0",
            },
            {
                paymentMethodId:
                    -1,
                title:
                    "負数",
            },
            {
                paymentMethodId:
                    1.5,
                title:
                    "小数",
            },
            {
                paymentMethodId:
                    Number.NaN,
                title:
                    "NaN",
            },
        ])(
            "支払い方法IDが$titleの場合は例外を投げる",
            async ({
                paymentMethodId,
            }) => {
                await expect(
                    repository.purchase(
                        paymentMethodId,
                        validItems,
                    ),
                ).rejects.toThrow(
                    "支払い方法を選択してください。",
                );

                expect(fetchMock).not.toHaveBeenCalled();

                expect(
                    customerAuthServiceMock.getAccessToken,
                ).not.toHaveBeenCalled();
            },
        );

        it("購入商品が空の場合は例外を投げる", async () => {
            await expect(
                repository.purchase(
                    1,
                    [],
                ),
            ).rejects.toThrow(
                "購入する商品がありません。",
            );

            expect(fetchMock).not.toHaveBeenCalled();
        });

        it.each([
            {
                title:
                    "商品UUIDが空",
                items: [
                    {
                        productUuid:
                            "",
                        quantity:
                            1,
                    },
                ],
            },
            {
                title:
                    "数量が0",
                items: [
                    {
                        productUuid:
                            "product-uuid-001",
                        quantity:
                            0,
                    },
                ],
            },
            {
                title:
                    "数量が負数",
                items: [
                    {
                        productUuid:
                            "product-uuid-001",
                        quantity:
                            -1,
                    },
                ],
            },
            {
                title:
                    "数量が小数",
                items: [
                    {
                        productUuid:
                            "product-uuid-001",
                        quantity:
                            1.5,
                    },
                ],
            },
        ])(
            "購入商品の$title場合は例外を投げる",
            async ({
                items,
            }) => {
                await expect(
                    repository.purchase(
                        1,
                        items,
                    ),
                ).rejects.toThrow(
                    "購入商品の内容が不正です。",
                );

                expect(fetchMock).not.toHaveBeenCalled();
            },
        );

        it("アクセストークンがない場合は認証情報を削除して例外を投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(null);

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "購入するにはログインが必要です。",
            );

            expect(
                customerAuthServiceMock.clearAuthentication,
            ).toHaveBeenCalledTimes(1);

            expect(fetchMock).not.toHaveBeenCalled();
        });

        it("401の場合は認証情報を削除して例外を投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "expired-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 401,
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "購入するにはログインが必要です。",
            );

            expect(
                customerAuthServiceMock.clearAuthentication,
            ).toHaveBeenCalledTimes(1);
        });

        it("404の場合はmessageを例外として投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn().mockResolvedValue({
                    message:
                        "指定された商品が見つかりません。",
                }),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "指定された商品が見つかりません。",
            );
        });

        it("404でmessageがない場合はdetailを例外として投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn().mockResolvedValue({
                    detail:
                        "支払い方法が存在しません。",
                }),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "支払い方法が存在しません。",
            );
        });

        it("404でmessageとdetailがない場合はtitleを例外として投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn().mockResolvedValue({
                    title:
                        "Not Found",
                }),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "Not Found",
            );
        });

        it("404でエラー情報がない場合は既定の例外を投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn().mockResolvedValue(
                    {},
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "商品または支払い方法が見つかりませんでした。",
            );
        });

        it("404のエラー本文をJSONとして取得できない場合も既定の例外を投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn().mockRejectedValue(
                    new Error(
                        "JSON parse error",
                    ),
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "商品または支払い方法が見つかりませんでした。",
            );
        });

        it("APIエラーのerrorsを結合して例外として投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 400,
                text: vi.fn().mockResolvedValue(
                    JSON.stringify({
                        errors: {
                            Items: [
                                "購入商品が不正です。",
                                "在庫数を確認してください。",
                            ],
                            PaymentMethod:
                                "支払い方法が不正です。",
                        },
                    }),
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                [
                    "購入商品が不正です。",
                    "在庫数を確認してください。",
                    "支払い方法が不正です。",
                ].join("\n"),
            );
        });

        it("APIエラーのmessageを例外として投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                text: vi.fn().mockResolvedValue(
                    JSON.stringify({
                        message:
                            "商品の購入処理に失敗しました。",
                    }),
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "商品の購入処理に失敗しました。",
            );
        });

        it("messageがない場合はdetailを例外として投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                text: vi.fn().mockResolvedValue(
                    JSON.stringify({
                        detail:
                            "在庫更新処理でエラーが発生しました。",
                    }),
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "在庫更新処理でエラーが発生しました。",
            );
        });

        it("messageとdetailがない場合はtitleを例外として投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                text: vi.fn().mockResolvedValue(
                    JSON.stringify({
                        title:
                            "Internal Server Error",
                    }),
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "Internal Server Error",
            );
        });

        it("JSON形式だがエラー情報がない場合はステータス付きの例外を投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 503,
                text: vi.fn().mockResolvedValue(
                    JSON.stringify({}),
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "商品の購入に失敗しました (Status: 503)",
            );
        });

        it("JSONでないレスポンス本文をそのまま例外として投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                text: vi.fn().mockResolvedValue(
                    "サーバーとの通信に失敗しました。",
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "サーバーとの通信に失敗しました。",
            );
        });

        it("レスポンス本文が空の場合はステータス付きの例外を投げる", async () => {
            customerAuthServiceMock
                .getAccessToken
                .mockReturnValue(
                    "customer-access-token",
                );

            fetchMock.mockResolvedValue({
                ok: false,
                status: 502,
                text: vi.fn().mockResolvedValue(
                    "",
                ),
            });

            await expect(
                repository.purchase(
                    1,
                    validItems,
                ),
            ).rejects.toThrow(
                "商品の購入に失敗しました (Status: 502)",
            );
        });
    });
});