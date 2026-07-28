// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
    cleanup,
    render,
    screen,
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

const mocks =
    vi.hoisted(
        () => ({
            isAuthenticated:
                false,
            isInitialized:
                true,
            replace:
                vi.fn(),
            findAllPaymentMethods:
                vi.fn(),
            purchase:
                vi.fn(),
        }),
    );

vi.mock(
    "next/navigation",
    () => ({
        useRouter:
            () => ({
                push:
                    vi.fn(),
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
                    mocks.isAuthenticated,
                isInitialized:
                    mocks.isInitialized,
            }),
    }),
);

vi.mock(
    "@/components/hooks/usePaymentMethod",
    () => ({
        usePaymentMethod:
            () => ({
                paymentMethods: [
                    {
                        id:
                            1,
                        name:
                            "銀行振込",
                    },
                ],
                isLoading:
                    false,
                errorMessage:
                    "",
                findAll:
                    mocks
                        .findAllPaymentMethods,
            }),
    }),
);

vi.mock(
    "@/contexts/CartContext",
    () => ({
        useCart:
            () => ({
                cartItems: [
                    {
                        product: {
                            productUuid:
                                "10000000-0000-0000-0000-000000000002",
                            productName:
                                "テスト商品",
                            price:
                                100,
                            productImage:
                                "",
                            stockQuantity:
                                10,
                        },
                        quantity:
                            1,
                    },
                ],
                totalQuantity:
                    1,
                totalPrice:
                    100,
                removeCart:
                    vi.fn(),
                updateCartQuantity:
                    vi.fn(),
                clearCart:
                    vi.fn(),
            }),
    }),
);

vi.mock(
    "@/di/container",
    () => ({
        container: {
            get:
                () => ({
                    purchase:
                        mocks.purchase,
                }),
        },
    }),
);

import {
    CartPage,
} from "@/components/cart/CartPage";

describe(
    "CartPage 顧客認証",
    () => {
        beforeEach(() => {
            mocks.isAuthenticated =
                false;
            mocks.isInitialized =
                true;
            mocks.replace
                .mockReset();
            mocks.findAllPaymentMethods
                .mockReset()
                .mockResolvedValue(
                    undefined,
                );
            mocks.purchase
                .mockReset()
                .mockResolvedValue(
                    undefined,
                );
        });

        afterEach(() => {
            cleanup();
        });

        it(
            "未ログインで購入確定を選ぶとログイン画面へ遷移する",
            async () => {
                const user =
                    userEvent.setup();

                render(
                    createElement(
                        CartPage,
                    ),
                );

                await user.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "購入を確定する",
                        },
                    ),
                );

                expect(
                    mocks.replace,
                ).toHaveBeenCalledWith(
                    "/login",
                );
                expect(
                    mocks.purchase,
                ).not.toHaveBeenCalled();
            },
        );

        it(
            "認証状態の初期化中は購入確定を選べない",
            () => {
                mocks.isInitialized =
                    false;

                render(
                    createElement(
                        CartPage,
                    ),
                );

                expect(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "購入を確定する",
                        },
                    ),
                ).toBeDisabled();
            },
        );
    },
);
