// @vitest-environment jsdom

import {
    createElement,
} from "react";

import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    useCustomerAuth,
} from "@/components/hooks/useCustomerAuth";

import {
    CustomerAuthProvider,
} from "@/contexts/CustomerAuthContext";

import type {
    ICustomerAuthService,
} from "@/interfaces/ICustomerAuthService";

const navigationMocks =
    vi.hoisted(
        () => ({
            replace:
                vi.fn(),
        }),
    );

vi.mock(
    "next/navigation",
    () => ({
        useRouter:
            () => ({
                replace:
                    navigationMocks.replace,
            }),
    }),
);

const AuthConsumer = () => {
    const {
        isAuthenticated,
        isInitialized,
        sessionMessage,
        login,
        logout,
    } = useCustomerAuth();

    return createElement(
        "div",
        null,
        createElement(
            "span",
            null,
            isInitialized
                ? "initialized"
                : "loading",
        ),
        createElement(
            "span",
            null,
            isAuthenticated
                ? "authenticated"
                : "anonymous",
        ),
        createElement(
            "span",
            null,
            sessionMessage
            ?? "no-session-message",
        ),
        createElement(
            "button",
            {
                type: "button",
                onClick: () => {
                    void login({
                        mailAddress:
                            "ando.taro@example.com",
                        password:
                            "Test12345",
                    });
                },
            },
            "login",
        ),
        createElement(
            "button",
            {
                type: "button",
                onClick: () => {
                    void logout()
                        .catch(
                            () => undefined,
                        );
                },
            },
            "logout",
        ),
    );
};

const renderAuthProvider =
    (
        service:
            ICustomerAuthService,
    ) =>
        render(
            createElement(
                CustomerAuthProvider,
                {
                    service,
                },
                createElement(
                    AuthConsumer,
                ),
            ),
        );

describe(
    "CustomerAuthContext",
    () => {
        let service:
            ICustomerAuthService;
        let authenticationClearedListener:
            (() => void) | undefined;

        beforeEach(() => {
            authenticationClearedListener =
                undefined;
            navigationMocks.replace
                .mockReset();

            service = {
                login:
                    vi.fn()
                        .mockResolvedValue({
                            isAuthenticated:
                                true,
                            expiresAt:
                                "2099-07-27T12:30:00.000Z",
                        }),
                logout:
                    vi.fn()
                        .mockResolvedValue(
                            undefined,
                        ),
                getAuthState:
                    vi.fn()
                        .mockReturnValue({
                            isAuthenticated:
                                false,
                            expiresAt:
                                null,
                        }),
                getAccessToken:
                    vi.fn()
                        .mockReturnValue(
                            null,
                        ),
                clearAuthentication:
                    vi.fn(
                        () => {
                            authenticationClearedListener
                                ?.();
                        },
                    ),
                subscribeToAuthenticationCleared:
                    vi.fn(
                        (
                            listener:
                                () => void,
                        ) => {
                            authenticationClearedListener =
                                listener;

                            return vi.fn();
                        },
                    ),
            };
        });

        afterEach(() => {
            cleanup();
            vi.useRealTimers();
            window.localStorage.clear();
        });

        it(
            "Client初期化時に保存済み認証状態を復元する",
            async () => {
                vi.mocked(
                    service.getAuthState,
                ).mockReturnValue({
                    isAuthenticated:
                        true,
                    expiresAt:
                        "2099-07-27T12:30:00.000Z",
                });

                renderAuthProvider(
                    service,
                );

                await waitFor(
                    () => {
                        expect(
                            screen.getByText(
                                "initialized",
                            ),
                        ).toBeDefined();
                        expect(
                            screen.getByText(
                                "authenticated",
                            ),
                        ).toBeDefined();
                    },
                );
            },
        );

        it(
            "保護APIの401通知で未認証へ切り替えてログイン画面へ遷移する",
            async () => {
                vi.mocked(
                    service.getAuthState,
                ).mockReturnValue({
                    isAuthenticated:
                        true,
                    expiresAt:
                        "2099-07-27T12:30:00.000Z",
                });

                renderAuthProvider(
                    service,
                );

                await waitFor(
                    () => {
                        expect(
                            screen.getByText(
                                "authenticated",
                            ),
                        ).toBeDefined();
                    },
                );

                act(() => {
                    service
                        .clearAuthentication();
                });

                expect(
                    screen.getByText(
                        "anonymous",
                    ),
                ).toBeDefined();
                expect(
                    screen.getByText(
                        "セッションが切れました。再度ログインしてください",
                    ),
                ).toBeDefined();
                expect(
                    navigationMocks.replace,
                ).toHaveBeenCalledWith(
                    "/login",
                );
            },
        );

        it(
            "ログイン成功後に認証済みへ切り替える",
            async () => {
                renderAuthProvider(
                    service,
                );

                fireEvent.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "login",
                        },
                    ),
                );

                await waitFor(
                    () => {
                        expect(
                            screen.getByText(
                                "authenticated",
                            ),
                        ).toBeDefined();
                    },
                );
            },
        );

        it(
            "expiresAtを迎えたら認証情報を削除して未認証へ切り替える",
            async () => {
                vi.useFakeTimers();
                vi.setSystemTime(
                    new Date(
                        "2026-07-27T12:00:00.000Z",
                    ),
                );
                vi.mocked(
                    service.getAuthState,
                ).mockReturnValue({
                    isAuthenticated:
                        true,
                    expiresAt:
                        "2026-07-27T12:00:01.000Z",
                });

                renderAuthProvider(
                    service,
                );

                await act(
                    async () => undefined,
                );

                expect(
                    screen.getByText(
                        "authenticated",
                    ),
                ).toBeDefined();

                act(() => {
                    vi.advanceTimersByTime(
                        1_000,
                    );
                });

                expect(
                    service
                        .clearAuthentication,
                ).toHaveBeenCalledOnce();
                expect(
                    screen.getByText(
                        "anonymous",
                    ),
                ).toBeDefined();
            },
        );

        it(
            "ログアウトAPIが失敗しても未認証へ切り替える",
            async () => {
                vi.mocked(
                    service.getAuthState,
                ).mockReturnValue({
                    isAuthenticated:
                        true,
                    expiresAt:
                        "2099-07-27T12:30:00.000Z",
                });
                vi.mocked(
                    service.logout,
                ).mockRejectedValue(
                    new Error(
                        "システムエラー",
                    ),
                );

                renderAuthProvider(
                    service,
                );

                await waitFor(
                    () => {
                        expect(
                            screen.getByText(
                                "authenticated",
                            ),
                        ).toBeDefined();
                    },
                );

                fireEvent.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "logout",
                        },
                    ),
                );

                await waitFor(
                    () => {
                        expect(
                            screen.getByText(
                                "anonymous",
                            ),
                        ).toBeDefined();
                    },
                );
            },
        );

        it(
            "ログアウトしてもカート用localStorageを削除しない",
            async () => {
                window.localStorage.setItem(
                    "product-cart",
                    JSON.stringify([
                        {
                            productUuid:
                                "product-1",
                            quantity: 2,
                        },
                    ]),
                );

                renderAuthProvider(
                    service,
                );

                fireEvent.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "logout",
                        },
                    ),
                );

                await waitFor(
                    () => {
                        expect(
                            service.logout,
                        ).toHaveBeenCalledOnce();
                    },
                );

                expect(
                    window.localStorage
                        .getItem(
                            "product-cart",
                        ),
                ).not.toBeNull();
            },
        );
    },
);
