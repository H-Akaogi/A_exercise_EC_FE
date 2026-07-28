import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    OrderRepository,
} from "@/infrastructures/OrderRepository";

import type {
    ICustomerAuthService,
} from "@/interfaces/ICustomerAuthService";

const createJsonResponse =
    (
        status: number,
        body: unknown,
    ): Response =>
        new Response(
            JSON.stringify(body),
            {
                status,
                headers: {
                    "Content-Type":
                        "application/json",
                },
            },
        );

const createAuthService =
    (
        accessToken: string | null,
    ) => {
        const getAccessToken =
            vi.fn<
                () => string | null
            >(
                () => accessToken,
            );
        const clearAuthentication =
            vi.fn<() => void>();

        return {
            service: {
                getAccessToken,
                clearAuthentication,
            } as unknown as
                ICustomerAuthService,
            getAccessToken,
            clearAuthentication,
        };
    };

const getRequestHeaders =
    (
        fetchMock:
            ReturnType<typeof vi.fn>,
    ): Record<string, string> => {
        const [
            ,
            options,
        ] = fetchMock.mock.calls[0] as [
            string,
            RequestInit,
        ];

        return options.headers as
            Record<string, string>;
    };

describe(
    "OrderRepository 顧客JWT認証",
    () => {
        afterEach(() => {
            vi.restoreAllMocks();
            vi.unstubAllGlobals();
        });

        it(
            "購入履歴一覧へBearer JWTを付ける",
            async () => {
                const {
                    service,
                    getAccessToken,
                } =
                    createAuthService(
                        "customer-jwt",
                    );
                const repository =
                    new OrderRepository(
                        service,
                    );
                const fetchMock =
                    vi.fn()
                        .mockResolvedValue(
                            createJsonResponse(
                                200,
                                {
                                    orderList:
                                        [],
                                    message:
                                        null,
                                },
                            ),
                        );

                vi.stubGlobal(
                    "fetch",
                    fetchMock,
                );

                await repository
                    .findPurchaseHistory();

                expect(
                    fetchMock,
                ).toHaveBeenCalledWith(
                    "/proxy-api/purchase/history",
                    expect.any(Object),
                );
                expect(
                    getRequestHeaders(
                        fetchMock,
                    ),
                ).toEqual({
                    Accept:
                        "application/json",
                    Authorization:
                        "Bearer customer-jwt",
                });
                expect(
                    getAccessToken,
                ).toHaveBeenCalledOnce();
            },
        );

        it(
            "購入履歴詳細へBearer JWTを付ける",
            async () => {
                const {
                    service,
                } =
                    createAuthService(
                        "customer-jwt",
                    );
                const repository =
                    new OrderRepository(
                        service,
                    );
                const fetchMock =
                    vi.fn()
                        .mockResolvedValue(
                            createJsonResponse(
                                200,
                                {
                                    orderUuid:
                                        "order-uuid",
                                    orderDate:
                                        "2026-07-28T00:00:00Z",
                                    orderStatusId:
                                        1,
                                    orderStatusName:
                                        "受付済み",
                                    orderItems:
                                        [],
                                    totalPrice:
                                        0,
                                },
                            ),
                        );

                vi.stubGlobal(
                    "fetch",
                    fetchMock,
                );

                await repository.findById(
                    "order-uuid",
                );

                expect(
                    fetchMock,
                ).toHaveBeenCalledWith(
                    "/proxy-api/purchase/history/order-uuid",
                    expect.any(Object),
                );
                expect(
                    getRequestHeaders(
                        fetchMock,
                    ).Authorization,
                ).toBe(
                    "Bearer customer-jwt",
                );
            },
        );

        it(
            "JWTがなければ認証ヘッダーを付けない",
            async () => {
                const {
                    service,
                } =
                    createAuthService(
                        null,
                    );
                const repository =
                    new OrderRepository(
                        service,
                    );
                const fetchMock =
                    vi.fn()
                        .mockResolvedValue(
                            createJsonResponse(
                                200,
                                {
                                    orderList:
                                        [],
                                    message:
                                        null,
                                },
                            ),
                        );

                vi.stubGlobal(
                    "fetch",
                    fetchMock,
                );

                await repository
                    .findPurchaseHistory();

                expect(
                    getRequestHeaders(
                        fetchMock,
                    ),
                ).toEqual({
                    Accept:
                        "application/json",
                });
            },
        );

        it(
            "一覧APIの401で保存済み認証情報を削除する",
            async () => {
                const {
                    service,
                    clearAuthentication,
                } =
                    createAuthService(
                        "expired-jwt",
                    );
                const repository =
                    new OrderRepository(
                        service,
                    );

                vi.stubGlobal(
                    "fetch",
                    vi.fn()
                        .mockResolvedValue(
                            createJsonResponse(
                                401,
                                {},
                            ),
                        ),
                );

                await expect(
                    repository
                        .findPurchaseHistory(),
                ).rejects.toThrow(
                    "購入履歴を確認するにはログインが必要です",
                );
                expect(
                    clearAuthentication,
                ).toHaveBeenCalledOnce();
            },
        );

        it(
            "詳細APIの401で保存済み認証情報を削除する",
            async () => {
                const {
                    service,
                    clearAuthentication,
                } =
                    createAuthService(
                        "expired-jwt",
                    );
                const repository =
                    new OrderRepository(
                        service,
                    );

                vi.stubGlobal(
                    "fetch",
                    vi.fn()
                        .mockResolvedValue(
                            createJsonResponse(
                                401,
                                {},
                            ),
                        ),
                );

                await expect(
                    repository.findById(
                        "order-uuid",
                    ),
                ).rejects.toThrow(
                    "購入履歴の詳細を確認するにはログインが必要です",
                );
                expect(
                    clearAuthentication,
                ).toHaveBeenCalledOnce();
            },
        );
    },
);
