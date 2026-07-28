import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
    type Mocked,
} from "vitest";

import {
    PaymentMethodService,
} from "@/services/PaymentMethodService";

import type {
    IPaymentMethodRepository,
} from "@/interfaces/IPaymentMethodRepository";

import type {
    PaymentMethod,
} from "@/models/PaymentMethod";

describe("PaymentMethodService", () => {
    let service:
        PaymentMethodService;

    /*
     * 実際のPaymentMethodRepositoryは使用せず、
     * Repository全体をVitestのモックとして扱う。
     */
    let paymentMethodRepositoryMock:
        Mocked<IPaymentMethodRepository>;

    beforeEach(() => {
        paymentMethodRepositoryMock = {
            findAll:
                vi.fn(),
        };

        service =
            new PaymentMethodService(
                paymentMethodRepositoryMock,
            );
    });

    describe("findAll", () => {
        it("Repositoryから取得した支払い方法一覧を返す", async () => {
            const expectedPaymentMethods:
                PaymentMethod[] = [
                    {
                        id:
                            1,
                        name:
                            "クレジットカード",
                    },
                    {
                        id:
                            2,
                        name:
                            "銀行振込",
                    },
                    {
                        id:
                            3,
                        name:
                            "代金引換",
                    },
                ];

            paymentMethodRepositoryMock
                .findAll
                .mockResolvedValue(
                    expectedPaymentMethods,
                );

            const result =
                await service.findAll();

            /*
             * ServiceからRepositoryのfindAllが
             * 1回呼ばれたことを確認する。
             */
            expect(
                paymentMethodRepositoryMock.findAll,
            ).toHaveBeenCalledTimes(
                1,
            );

            /*
             * findAllには引数がないことを確認する。
             */
            expect(
                paymentMethodRepositoryMock.findAll,
            ).toHaveBeenCalledWith();

            /*
             * Repositoryの戻り値を
             * Serviceがそのまま返すことを確認する。
             */
            expect(result).toEqual(
                expectedPaymentMethods,
            );
        });

        it("支払い方法がない場合は空配列を返す", async () => {
            paymentMethodRepositoryMock
                .findAll
                .mockResolvedValue(
                    [],
                );

            const result =
                await service.findAll();

            expect(result).toEqual(
                [],
            );

            expect(
                paymentMethodRepositoryMock.findAll,
            ).toHaveBeenCalledTimes(
                1,
            );
        });

        it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
            paymentMethodRepositoryMock
                .findAll
                .mockRejectedValue(
                    new Error(
                        "支払い方法一覧の取得に失敗しました。",
                    ),
                );

            await expect(
                service.findAll(),
            ).rejects.toThrow(
                "支払い方法一覧の取得に失敗しました。",
            );

            expect(
                paymentMethodRepositoryMock.findAll,
            ).toHaveBeenCalledTimes(
                1,
            );
        });
    });
});