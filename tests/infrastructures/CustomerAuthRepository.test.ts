import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    CustomerAuthRepository,
} from "@/infrastructures/CustomerAuthRepository";

const createResponse =
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

describe(
    "CustomerAuthRepository",
    () => {
        let repository:
            CustomerAuthRepository;

        beforeEach(() => {
            repository =
                new CustomerAuthRepository();
        });

        afterEach(() => {
            vi.restoreAllMocks();
            vi.unstubAllGlobals();
        });

        describe("login", () => {
            it(
                "POST /proxy-api/loginへ認証情報を送信してJWTと有効期限を返す",
                async () => {
                    const fetchMock =
                        vi.fn()
                            .mockResolvedValue(
                                createResponse(
                                    200,
                                    {
                                        accessToken:
                                            "customer-jwt",
                                        expiresAt:
                                            "2026-07-27T12:34:56+00:00",
                                        username:
                                            "andoTaro",
                                    },
                                ),
                            );

                    vi.stubGlobal(
                        "fetch",
                        fetchMock,
                    );

                    const result =
                        await repository.login(
                            {
                                mailAddress:
                                    "ando.taro@example.com",
                                password:
                                    "Test12345",
                            },
                        );

                    expect(result).toEqual({
                        accessToken:
                            "customer-jwt",
                        expiresAt:
                            "2026-07-27T12:34:56+00:00",
                        username:
                            "andoTaro",
                    });

                    const [
                        url,
                        options,
                    ] =
                        fetchMock.mock.calls[0] as [
                            string,
                            RequestInit,
                        ];

                    expect(url).toBe(
                        "/proxy-api/login",
                    );
                    expect(options.method).toBe(
                        "POST",
                    );
                    expect(
                        JSON.parse(
                            options.body as string,
                        ),
                    ).toEqual({
                        mailAddress:
                            "ando.taro@example.com",
                        password:
                            "Test12345",
                    });
                },
            );

            it(
                "400の入力値エラーをAPI応答から取得する",
                async () => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockResolvedValue(
                                createResponse(
                                    400,
                                    {
                                        errors: {
                                            Password: [
                                                "パスワードは5～20文字で入力してください。",
                                            ],
                                        },
                                    },
                                ),
                            ),
                    );

                    await expect(
                        repository.login({
                            mailAddress:
                                "ando.taro@example.com",
                            password: "1234",
                        }),
                    ).rejects.toThrow(
                        "パスワードは5～20文字で入力してください。",
                    );
                },
            );

            it(
                "401ではアカウントの存在を推測できない汎用エラーを返す",
                async () => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockResolvedValue(
                                createResponse(
                                    401,
                                    {
                                        message:
                                            "内部情報",
                                    },
                                ),
                            ),
                    );

                    await expect(
                        repository.login({
                            mailAddress:
                                "nobody@example.com",
                            password:
                                "WrongPassword",
                        }),
                    ).rejects.toThrow(
                        "メールアドレスまたはパスワードが正しくありません。",
                    );
                },
            );

            it(
                "500の本文が不正でもシステムエラーを返す",
                async () => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockResolvedValue(
                                new Response(
                                    "not-json",
                                    {
                                        status: 500,
                                    },
                                ),
                            ),
                    );

                    await expect(
                        repository.login({
                            mailAddress:
                                "ando.taro@example.com",
                            password:
                                "Test12345",
                        }),
                    ).rejects.toThrow(
                        "システムエラーが発生しました。",
                    );
                },
            );

            it(
                "通信できない場合は内部情報を含まないシステムエラーを返す",
                async () => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockRejectedValue(
                                new TypeError(
                                    "secret network detail",
                                ),
                            ),
                    );

                    await expect(
                        repository.login({
                            mailAddress:
                                "ando.taro@example.com",
                            password:
                                "Test12345",
                        }),
                    ).rejects.toThrow(
                        "システムエラーが発生しました。",
                    );
                },
            );

            it(
                "成功応答にJWTがなければ形式エラーにする",
                async () => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockResolvedValue(
                                createResponse(
                                    200,
                                    {
                                        expiresAt:
                                            "2026-07-27T12:34:56+00:00",
                                        username:
                                            "andoTaro",
                                    },
                                ),
                            ),
                    );

                    await expect(
                        repository.login({
                            mailAddress:
                                "ando.taro@example.com",
                            password:
                                "Test12345",
                        }),
                    ).rejects.toThrow(
                        "ログイン応答の形式が正しくありません。",
                    );
                },
            );

            it(
                "正式な2項目の成功応答を受け入れる",
                async () => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockResolvedValue(
                                createResponse(
                                    200,
                                    {
                                        accessToken:
                                            "customer-jwt",
                                        expiresAt:
                                            "2026-07-27T12:34:56+00:00",
                                    },
                                ),
                            ),
                    );

                    await expect(
                        repository.login({
                            mailAddress:
                                "ando.taro@example.com",
                            password:
                                "Test12345",
                        }),
                    ).resolves.toEqual({
                        accessToken:
                            "customer-jwt",
                        expiresAt:
                            "2026-07-27T12:34:56+00:00",
                    });
                },
            );

            it(
                "パスワードやJWTをconsoleへ出力しない",
                async () => {
                    const logSpy =
                        vi.spyOn(
                            console,
                            "log",
                        );
                    const errorSpy =
                        vi.spyOn(
                            console,
                            "error",
                        );

                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockResolvedValue(
                                createResponse(
                                    200,
                                    {
                                        accessToken:
                                            "secret-jwt",
                                        expiresAt:
                                            "2026-07-27T12:34:56+00:00",
                                        username:
                                            "andoTaro",
                                    },
                                ),
                            ),
                    );

                    await repository.login({
                        mailAddress:
                            "ando.taro@example.com",
                        password:
                            "Test12345",
                    });

                    expect(
                        logSpy,
                    ).not.toHaveBeenCalled();
                    expect(
                        errorSpy,
                    ).not.toHaveBeenCalled();
                },
            );
        });

        describe("logout", () => {
            it(
                "Bearer JWT付きでPOST /proxy-api/logoutを呼ぶ",
                async () => {
                    const fetchMock =
                        vi.fn()
                            .mockResolvedValue(
                                createResponse(
                                    200,
                                    {
                                        loggedOut:
                                            true,
                                    },
                                ),
                            );

                    vi.stubGlobal(
                        "fetch",
                        fetchMock,
                    );

                    await expect(
                        repository.logout(
                            "customer-jwt",
                        ),
                    ).resolves.toEqual({
                        loggedOut: true,
                    });

                    const [
                        url,
                        options,
                    ] =
                        fetchMock.mock.calls[0] as [
                            string,
                            RequestInit,
                        ];

                    expect(url).toBe(
                        "/proxy-api/logout",
                    );
                    expect(options.method).toBe(
                        "POST",
                    );
                    expect(
                        (
                            options.headers as
                            Record<string, string>
                        ).Authorization,
                    ).toBe(
                        "Bearer customer-jwt",
                    );
                },
            );

            it(
                "401では再ログインを促す",
                async () => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockResolvedValue(
                                createResponse(
                                    401,
                                    {},
                                ),
                            ),
                    );

                    await expect(
                        repository.logout(
                            "expired-jwt",
                        ),
                    ).rejects.toThrow(
                        "認証の有効期限が切れています。再度ログインしてください。",
                    );
                },
            );

            it(
                "通信できない場合はログアウト処理エラーを返す",
                async () => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn()
                            .mockRejectedValue(
                                new TypeError(
                                    "network detail",
                                ),
                            ),
                    );

                    await expect(
                        repository.logout(
                            "customer-jwt",
                        ),
                    ).rejects.toThrow(
                        "ログアウト処理に失敗しました。",
                    );
                },
            );
        });
    },
);
