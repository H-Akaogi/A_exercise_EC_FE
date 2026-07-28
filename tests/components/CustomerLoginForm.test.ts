// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";

import userEvent from
    "@testing-library/user-event";

import {
    createElement,
} from "react";

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    CustomerLoginValidationError,
} from "@/models/CustomerAuth";

const mocks =
    vi.hoisted(
        () => ({
            login:
                vi.fn(),
            sessionMessage:
                null as string | null,
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
                    mocks.replace,
            }),
    }),
);

vi.mock(
    "@/components/hooks/useCustomerAuth",
    () => ({
        useCustomerAuth:
            () => ({
                isAuthenticated:
                    false,
                expiresAt:
                    null,
                isInitialized:
                    true,
                sessionMessage:
                    mocks.sessionMessage,
                login:
                    mocks.login,
                logout:
                    vi.fn(),
                getAccessToken:
                    vi.fn(),
                clearAuthentication:
                    vi.fn(),
            }),
    }),
);

import {
    CustomerLoginForm,
} from "@/components/auth/CustomerLoginForm";

describe(
    "CustomerLoginForm",
    () => {
        beforeEach(() => {
            mocks.sessionMessage =
                null;
            mocks.login
                .mockReset()
                .mockResolvedValue(
                    undefined,
                );
            mocks.replace
                .mockReset();
        });

        afterEach(() => {
            cleanup();
        });

        it(
            "セッションタイムアウトの案内を表示する",
            () => {
                mocks.sessionMessage =
                    "セッションが切れました。再度ログインしてください";

                render(
                    createElement(
                        CustomerLoginForm,
                    ),
                );

                expect(
                    screen.getByRole(
                        "alert",
                    ),
                ).toHaveTextContent(
                    "セッションが切れました。再度ログインしてください",
                );
            },
        );

        it(
            "メールアドレスとマスクされたパスワード入力を表示する",
            () => {
                render(
                    createElement(
                        CustomerLoginForm,
                    ),
                );

                expect(
                    screen.getByRole(
                        "heading",
                        {
                            name:
                                "ログイン",
                        },
                    ),
                ).toBeDefined();

                expect(
                    screen.getByLabelText(
                        "メールアドレス",
                    ),
                ).toHaveAttribute(
                    "type",
                    "email",
                );

                const passwordInput =
                    screen.getByLabelText(
                        "パスワード",
                    );

                expect(
                    passwordInput,
                ).toHaveAttribute(
                    "type",
                    "password",
                );
                expect(
                    passwordInput,
                ).toHaveAttribute(
                    "minlength",
                    "5",
                );
                expect(
                    passwordInput,
                ).toHaveAttribute(
                    "maxlength",
                    "20",
                );
                expect(
                    passwordInput
                        .closest("form"),
                ).toHaveAttribute(
                    "method",
                    "post",
                );
            },
        );

        it(
            "認証成功後にトップ画面へ遷移する",
            async () => {
                const user =
                    userEvent.setup();

                render(
                    createElement(
                        CustomerLoginForm,
                    ),
                );

                await user.type(
                    screen.getByLabelText(
                        "メールアドレス",
                    ),
                    "ando.taro@example.com",
                );
                await user.type(
                    screen.getByLabelText(
                        "パスワード",
                    ),
                    "Test12345",
                );
                await user.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "ログイン",
                        },
                    ),
                );

                expect(
                    mocks.login,
                ).toHaveBeenCalledWith({
                    mailAddress:
                        "ando.taro@example.com",
                    password:
                        "Test12345",
                });
                expect(
                    mocks.replace,
                ).toHaveBeenCalledWith(
                    "/",
                );
            },
        );

        it(
            "入力値エラーを項目ごとに表示する",
            async () => {
                mocks.login
                    .mockRejectedValue(
                        new CustomerLoginValidationError(
                            {
                                mailAddress:
                                    "メールアドレスを入力してください。",
                                password:
                                    "パスワードを入力してください。",
                            },
                        ),
                    );

                const user =
                    userEvent.setup();

                render(
                    createElement(
                        CustomerLoginForm,
                    ),
                );

                await user.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "ログイン",
                        },
                    ),
                );

                expect(
                    screen.getByText(
                        "メールアドレスを入力してください。",
                    ),
                ).toBeDefined();
                expect(
                    screen.getByText(
                        "パスワードを入力してください。",
                    ),
                ).toBeDefined();
                expect(
                    mocks.replace,
                ).not.toHaveBeenCalled();
            },
        );

        it(
            "401の汎用エラーを表示し入力値を保持する",
            async () => {
                mocks.login
                    .mockRejectedValue(
                        new Error(
                            "メールアドレスまたはパスワードが正しくありません。",
                        ),
                    );

                const user =
                    userEvent.setup();

                render(
                    createElement(
                        CustomerLoginForm,
                    ),
                );

                const mailInput =
                    screen.getByLabelText(
                        "メールアドレス",
                    );
                const passwordInput =
                    screen.getByLabelText(
                        "パスワード",
                    );

                await user.type(
                    mailInput,
                    "ando.taro@example.com",
                );
                await user.type(
                    passwordInput,
                    "Wrong123",
                );
                await user.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "ログイン",
                        },
                    ),
                );

                expect(
                    screen.getByRole(
                        "alert",
                    ),
                ).toHaveTextContent(
                    "メールアドレスまたはパスワードが正しくありません。",
                );
                expect(
                    mailInput,
                ).toHaveValue(
                    "ando.taro@example.com",
                );
                expect(
                    passwordInput,
                ).toHaveValue(
                    "Wrong123",
                );
            },
        );

        it(
            "送信中は二重送信しない",
            async () => {
                let completeLogin:
                    (() => void) | undefined;

                mocks.login
                    .mockReturnValue(
                        new Promise<void>(
                            (
                                resolve,
                            ) => {
                                completeLogin =
                                    resolve;
                            },
                        ),
                    );

                render(
                    createElement(
                        CustomerLoginForm,
                    ),
                );

                fireEvent.change(
                    screen.getByLabelText(
                        "メールアドレス",
                    ),
                    {
                        target: {
                            value:
                                "ando.taro@example.com",
                        },
                    },
                );
                fireEvent.change(
                    screen.getByLabelText(
                        "パスワード",
                    ),
                    {
                        target: {
                            value:
                                "Test12345",
                        },
                    },
                );

                const form =
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "ログイン",
                        },
                    ).closest(
                        "form",
                    );

                expect(
                    form,
                ).not.toBeNull();

                fireEvent.submit(
                    form as HTMLFormElement,
                );
                fireEvent.submit(
                    form as HTMLFormElement,
                );

                expect(
                    mocks.login,
                ).toHaveBeenCalledOnce();
                expect(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "ログイン中",
                        },
                    ),
                ).toBeDisabled();

                completeLogin?.();

                await waitFor(
                    () => {
                        expect(
                            mocks.replace,
                        ).toHaveBeenCalledWith(
                            "/",
                        );
                    },
                );
            },
        );
    },
);
