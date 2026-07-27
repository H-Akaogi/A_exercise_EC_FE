"use client";

import {
    useCallback,
    useMemo,
    useState,
} from "react";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import type {
    IOrderService,
} from "@/interfaces/IOrderService";

import type {
    Orders,
} from "@/models/Orders";

/**
 * 購入履歴詳細画面のStateと操作を提供するフック
 */
export const usePurchaseHistoryDetail = () => {
    const orderService =
        useMemo(
            () =>
                container.get<IOrderService>(
                    TYPES.IOrderService,
                ),
            [],
        );

    const [
        order,
        setOrder,
    ] = useState<Orders | null>(null);

    const [
        isLoading,
        setIsLoading,
    ] = useState<boolean>(false);

    const [
        hasLoaded,
        setHasLoaded,
    ] = useState<boolean>(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string>("");

    /**
     * 注文UUIDから購入履歴詳細を取得する
     */
    const findById =
        useCallback(
            async (
                orderUuid: string,
            ): Promise<void> => {
                setIsLoading(true);
                setHasLoaded(false);
                setErrorMessage("");
                setOrder(null);

                try {
                    const result =
                        await orderService
                            .findById(
                                orderUuid,
                            );

                    setOrder(result);
                } catch (error) {
                    console.error(
                        "購入履歴詳細取得中にエラーが発生しました",
                        error,
                    );

                    setOrder(null);

                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "購入履歴詳細の取得に失敗しました",
                    );
                } finally {
                    setIsLoading(false);
                    setHasLoaded(true);
                }
            },
            [orderService],
        );

    return {
        order,
        isLoading,
        hasLoaded,
        errorMessage,
        findById,
    };
};