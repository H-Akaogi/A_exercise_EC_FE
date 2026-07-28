import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { ProductCategoryRepository } from "@/infrastructures/ProductCategoryRepository";

describe("ProductCategoryRepository", () => {
    let repository: ProductCategoryRepository;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        repository =
            new ProductCategoryRepository();

        fetchMock =
            vi.fn();

        vi.stubGlobal(
            "fetch",
            fetchMock,
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe("findAll", () => {
        it("カテゴリ一覧を取得してProductCategoryへ変換できる", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue([
                    {
                        value:
                            "category-uuid-001",
                        label:
                            "食品",
                    },
                    {
                        value:
                            "category-uuid-002",
                        label:
                            "飲料",
                    },
                    {
                        value:
                            "category-uuid-003",
                        label:
                            "日用品",
                    },
                ]),
            });

            const result =
                await repository.findAll();

            expect(fetchMock).toHaveBeenCalledTimes(
                1,
            );

            expect(fetchMock).toHaveBeenCalledWith(
                "/proxy-api/product-category/options",
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

            expect(result).toEqual([
                {
                    categoryUuid:
                        "category-uuid-001",
                    name:
                        "食品",
                },
                {
                    categoryUuid:
                        "category-uuid-002",
                    name:
                        "飲料",
                },
                {
                    categoryUuid:
                        "category-uuid-003",
                    name:
                        "日用品",
                },
            ]);
        });

        it("カテゴリが存在しない場合は空配列を返す", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(
                    [],
                ),
            });

            const result =
                await repository.findAll();

            expect(result).toEqual([]);
        });

        it("valueをcategoryUuidへ、labelをnameへ変換する", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue([
                    {
                        value:
                            "test-category-uuid",
                        label:
                            "テストカテゴリ",
                    },
                ]),
            });

            const result =
                await repository.findAll();

            expect(result[0]).toEqual({
                categoryUuid:
                    "test-category-uuid",
                name:
                    "テストカテゴリ",
            });
        });

        it("APIエラーのmessageを例外として投げる", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn().mockResolvedValue({
                    message:
                        "カテゴリを取得できませんでした。",
                }),
            });

            await expect(
                repository.findAll(),
            ).rejects.toThrow(
                "カテゴリを取得できませんでした。",
            );
        });

        it("messageがない場合はdetailを例外として投げる", async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn().mockResolvedValue({
                    detail:
                        "カテゴリ取得処理でエラーが発生しました。",
                }),
            });

            await expect(
                repository.findAll(),
            ).rejects.toThrow(
                "カテゴリ取得処理でエラーが発生しました。",
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
                repository.findAll(),
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
                repository.findAll(),
            ).rejects.toThrow(
                "カテゴリ一覧の取得に失敗しました (Status: 503)",
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
                repository.findAll(),
            ).rejects.toThrow(
                "カテゴリ一覧の取得に失敗しました (Status: 502)",
            );
        });
    });
});