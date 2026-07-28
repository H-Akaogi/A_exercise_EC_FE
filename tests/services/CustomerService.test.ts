import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
    type Mocked,
} from "vitest";

import {
    CustomerService,
} from "@/services/CustomerService";

import type {
    ICustomerRepository,
} from "@/interfaces/ICustomerRepository";

import type {
    Customer,
} from "@/models/Customer";

import type {
    CustomerFormResponse,
} from "@/models/CustomerFormResponse";

import type {
    CustomerCompleteResponse,
} from "@/models/CustomerCompleteResponse";

describe("CustomerService", () => {
    let service:
        CustomerService;

    /*
     * ICustomerRepositoryの全メソッドを
     * Vitestのモックとして扱う。
     *
     * 実際のCustomerRepositoryやfetchは使用しない。
     */
    let customerRepositoryMock:
        Mocked<ICustomerRepository>;

    beforeEach(() => {
        /*
         * Repositoryの各メソッドを
         * vi.fn()で完全にモック化する。
         */
        customerRepositoryMock = {
            getForm:
                vi.fn(),

            existsByAccountName:
                vi.fn(),

            existsByMail:
                vi.fn(),

            create:
                vi.fn(),
        };

        /*
         * モックRepositoryをServiceへ注入する。
         */
        service =
            new CustomerService(
                customerRepositoryMock,
            );
    });

    describe("getForm", () => {
        it("Repositoryから取得した顧客登録フォームを返す", async () => {
            const expectedResponse:
                CustomerFormResponse = {
                title:
                    "顧客登録",
                model: {
                    customerUuid:
                        "",
                    name:
                        "",
                    kana:
                        "",
                    address1:
                        "",
                    address2:
                        null,
                    phoneNumber:
                        "",
                    mailAddress:
                        "",
                    username:
                        "",
                    password:
                        "",
                    createdAt:
                        "",
                },
            };

            /*
             * RepositoryのgetFormが返す値を設定する。
             */
            customerRepositoryMock
                .getForm
                .mockResolvedValue(
                    expectedResponse,
                );

            const result =
                await service.getForm();

            /*
             * ServiceがRepositoryを1回呼んだことを確認する。
             */
            expect(
                customerRepositoryMock.getForm,
            ).toHaveBeenCalledTimes(
                1,
            );

            /*
             * getFormには引数がないことを確認する。
             */
            expect(
                customerRepositoryMock.getForm,
            ).toHaveBeenCalledWith();

            /*
             * Repositoryの戻り値を
             * Serviceがそのまま返すことを確認する。
             */
            expect(result).toEqual(
                expectedResponse,
            );
        });

        it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
            customerRepositoryMock
                .getForm
                .mockRejectedValue(
                    new Error(
                        "初期情報の取得に失敗しました。",
                    ),
                );

            await expect(
                service.getForm(),
            ).rejects.toThrow(
                "初期情報の取得に失敗しました。",
            );

            expect(
                customerRepositoryMock.getForm,
            ).toHaveBeenCalledTimes(
                1,
            );
        });
    });

    describe("existsByAccountName", () => {
        it("アカウント名が存在する場合はtrueを返す", async () => {
            customerRepositoryMock
                .existsByAccountName
                .mockResolvedValue(
                    true,
                );

            const result =
                await service
                    .existsByAccountName(
                        "existing-user",
                    );

            /*
             * Serviceが受け取ったアカウント名を
             * Repositoryへそのまま渡すことを確認する。
             */
            expect(
                customerRepositoryMock
                    .existsByAccountName,
            ).toHaveBeenCalledTimes(
                1,
            );

            expect(
                customerRepositoryMock
                    .existsByAccountName,
            ).toHaveBeenCalledWith(
                "existing-user",
            );

            expect(result).toBe(
                true,
            );
        });

        it("アカウント名が存在しない場合はfalseを返す", async () => {
            customerRepositoryMock
                .existsByAccountName
                .mockResolvedValue(
                    false,
                );

            const result =
                await service
                    .existsByAccountName(
                        "available-user",
                    );

            expect(
                customerRepositoryMock
                    .existsByAccountName,
            ).toHaveBeenCalledWith(
                "available-user",
            );

            expect(result).toBe(
                false,
            );
        });

        it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
            customerRepositoryMock
                .existsByAccountName
                .mockRejectedValue(
                    new Error(
                        "アカウント名の確認に失敗しました。",
                    ),
                );

            await expect(
                service.existsByAccountName(
                    "test-user",
                ),
            ).rejects.toThrow(
                "アカウント名の確認に失敗しました。",
            );

            expect(
                customerRepositoryMock
                    .existsByAccountName,
            ).toHaveBeenCalledWith(
                "test-user",
            );
        });
    });

    describe("existsByMail", () => {
        it("メールアドレスが存在する場合はtrueを返す", async () => {
            customerRepositoryMock
                .existsByMail
                .mockResolvedValue(
                    true,
                );

            const result =
                await service.existsByMail(
                    "existing@example.com",
                );

            /*
             * Serviceが受け取ったメールアドレスを
             * Repositoryへそのまま渡すことを確認する。
             */
            expect(
                customerRepositoryMock.existsByMail,
            ).toHaveBeenCalledTimes(
                1,
            );

            expect(
                customerRepositoryMock.existsByMail,
            ).toHaveBeenCalledWith(
                "existing@example.com",
            );

            expect(result).toBe(
                true,
            );
        });

        it("メールアドレスが存在しない場合はfalseを返す", async () => {
            customerRepositoryMock
                .existsByMail
                .mockResolvedValue(
                    false,
                );

            const result =
                await service.existsByMail(
                    "available@example.com",
                );

            expect(
                customerRepositoryMock.existsByMail,
            ).toHaveBeenCalledWith(
                "available@example.com",
            );

            expect(result).toBe(
                false,
            );
        });

        it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
            customerRepositoryMock
                .existsByMail
                .mockRejectedValue(
                    new Error(
                        "メールアドレスの確認に失敗しました。",
                    ),
                );

            await expect(
                service.existsByMail(
                    "test@example.com",
                ),
            ).rejects.toThrow(
                "メールアドレスの確認に失敗しました。",
            );

            expect(
                customerRepositoryMock.existsByMail,
            ).toHaveBeenCalledWith(
                "test@example.com",
            );
        });
    });

    describe("create", () => {
        const customer:
            Customer = {
            customerUuid:
                "",
            name:
                "山田太郎",
            kana:
                "ヤマダタロウ",
            address1:
                "東京都新宿区西新宿1-1-1",
            address2:
                "新宿ビル101",
            phoneNumber:
                "09012345678",
            mailAddress:
                "taro@example.com",
            username:
                "taro-user",
            password:
                "Password123",
            createdAt:
                "",
        };

        it("Repositoryへ顧客情報を渡して登録結果を返す", async () => {
            const expectedResponse:
                CustomerCompleteResponse = {
                title:
                    "顧客登録完了",
                message:
                    "顧客アカウントを登録しました。",
                customerUuid:
                    "customer-uuid-001",
                name:
                    "山田太郎",
                username:
                    "taro-user",
                createdAt:
                    "2026-07-28T12:00:00Z",
            };

            customerRepositoryMock
                .create
                .mockResolvedValue(
                    expectedResponse,
                );

            const result =
                await service.create(
                    customer,
                );

            /*
             * Serviceが受け取ったCustomerを
             * Repositoryへそのまま渡すことを確認する。
             */
            expect(
                customerRepositoryMock.create,
            ).toHaveBeenCalledTimes(
                1,
            );

            expect(
                customerRepositoryMock.create,
            ).toHaveBeenCalledWith(
                customer,
            );

            /*
             * Repositoryの登録結果を
             * Serviceがそのまま返すことを確認する。
             */
            expect(result).toEqual(
                expectedResponse,
            );
        });

        it("Repositoryで発生したエラーを呼び出し元へ返す", async () => {
            customerRepositoryMock
                .create
                .mockRejectedValue(
                    new Error(
                        "顧客アカウントの登録に失敗しました。",
                    ),
                );

            await expect(
                service.create(
                    customer,
                ),
            ).rejects.toThrow(
                "顧客アカウントの登録に失敗しました。",
            );

            expect(
                customerRepositoryMock.create,
            ).toHaveBeenCalledWith(
                customer,
            );
        });
    });
});