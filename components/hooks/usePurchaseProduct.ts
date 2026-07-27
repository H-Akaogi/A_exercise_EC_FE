"use client";

import {
    useCallback,
    useMemo,
    useState,
} from "react";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import type { IPurchaseProductService } from "@/interfaces/IPurchaseProductService";
import type { Product } from "@/models/Product";

/**
 * 商品情報の取得に必要なStateと操作を提供するカスタムフック
 */
export const usePurchaseProduct = () => {
    /**
     * DIコンテナから購入Serviceを取得する。
     *
     * 再レンダリングのたびに取得し直さないよう、
     * useMemoを使用する。
     */
    const purchaseService =
        useMemo(
            () =>
                container.get<IPurchaseProductService>(
                    TYPES.IPurchaseProductService,
                ),
            [],
        );

    /**
     * 商品一覧
     */
    const [
        products,
        setProducts,
    ] = useState<Product[]>([]);

    /**
     * 詳細画面で表示する商品
     */
    const [
        selectedProduct,
        setSelectedProduct,
    ] = useState<Product | null>(null);

    /**
     * 処理中フラグ
     */
    const [
        isLoading,
        setIsLoading,
    ] = useState<boolean>(false);

    /**
     * 現在選択されているカテゴリUUID
     *
     * 空文字の場合は全カテゴリ。
     */
    const [
        selectedCategoryUuid,
        setSelectedCategoryUuid,
    ] = useState<string>("");

    /**
     * エラーメッセージ
     */
    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string>("");

    /**
     * カテゴリを指定して商品を取得する
     *
     * categoryUuidが空文字の場合は全件取得する。
     *
     * @param categoryUuid 商品カテゴリUUID
     */
    const findByCategory =
        useCallback(
            async (
                categoryUuid: string = "",
            ): Promise<void> => {
                setIsLoading(true);
                setErrorMessage("");
                setSelectedCategoryUuid(
                    categoryUuid,
                );

                try {
                    const result =
                        await purchaseService
                            .findByCategory(
                                categoryUuid
                                || undefined,
                            );

                    setProducts(result);
                } catch (error) {
                    console.error(
                        "商品一覧取得中にエラーが発生しました",
                        error,
                    );

                    setProducts([]);

                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "商品一覧の取得に失敗しました",
                    );
                } finally {
                    setIsLoading(false);
                }
            },
            [purchaseService],
        );

    /**
     * 商品を全件取得する
     */
    const findAll =
        useCallback(
            async (): Promise<void> => {
                await findByCategory("");
            },
            [findByCategory],
        );

    /**
     * 商品UUIDを指定して商品を1件取得する
     *
     * @param productUuid 商品UUID
     */
    const findById =
        useCallback(
            async (
                productUuid: string,
            ): Promise<void> => {
                setIsLoading(true);
                setErrorMessage("");
                setSelectedProduct(null);

                try {
                    const result =
                        await purchaseService.findById(
                            productUuid,
                        );

                    if (!result) {
                        setErrorMessage(
                            "商品が見つかりませんでした",
                        );

                        return;
                    }

                    setSelectedProduct(result);
                } catch (error) {
                    console.error(
                        "商品詳細取得中にエラーが発生しました",
                        error,
                    );

                    setSelectedProduct(null);

                    setErrorMessage(
                        "商品詳細の取得に失敗しました",
                    );
                } finally {
                    setIsLoading(false);
                }
            },
            [purchaseService],
        );

    /**
     * 表示中の商品情報を初期化する
     */
    const clearSelectedProduct =
        useCallback(
            (): void => {
                setSelectedProduct(null);
                setErrorMessage("");
            },
            [],
        );

    return {
        products,
        selectedProduct,
        selectedCategoryUuid,
        isLoading,
        errorMessage,

        findAll,
        findById,
        findByCategory,
        clearSelectedProduct,
    };
};