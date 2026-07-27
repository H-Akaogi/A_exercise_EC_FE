"use client";

import {
    useCallback,
    useMemo,
    useState,
} from "react";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import type {
    IPaymentMethodService,
} from "@/interfaces/IPaymentMethodService";

import type {
    PaymentMethod,
} from "@/models/PaymentMethod";

/**
 * 支払い方法一覧のStateと操作を提供するフック
 */
export const usePaymentMethod = () => {
    const service =
        useMemo(
            () =>
                container.get<IPaymentMethodService>(
                    TYPES.IPaymentMethodService,
                ),
            [],
        );

    const [
        paymentMethods,
        setPaymentMethods,
    ] = useState<PaymentMethod[]>([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState<boolean>(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string>("");

    /**
     * 支払い方法を全件取得する
     */
    const findAll =
        useCallback(
            async (): Promise<void> => {
                setIsLoading(true);
                setErrorMessage("");

                try {
                    const result =
                        await service.findAll();

                    setPaymentMethods(result);
                } catch (error) {
                    console.error(
                        "支払い方法一覧取得中にエラーが発生しました",
                        error,
                    );

                    setPaymentMethods([]);

                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "支払い方法一覧の取得に失敗しました",
                    );
                } finally {
                    setIsLoading(false);
                }
            },
            [service],
        );

    return {
        paymentMethods,
        isLoading,
        errorMessage,
        findAll,
    };
};