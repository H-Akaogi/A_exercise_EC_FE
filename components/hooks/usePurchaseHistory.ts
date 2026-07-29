"use client";

import { useCallback, useMemo, useState } from "react";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import type { IOrderService } from "@/interfaces/IOrderService";

import type { OrderSearchItem } from "@/models/SearchOrdersResponse";

/**
 * 購入履歴一覧画面のStateと操作を提供するフック
 */
export const usePurchaseHistory = () => {
  const orderService = useMemo(
    () => container.get<IOrderService>(TYPES.IOrderService),
    [],
  );

  const [orderList, setOrderList] = useState<OrderSearchItem[]>([]);

  const [message, setMessage] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");

  /**
   * 購入履歴一覧を取得する
   */
  const findAll = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      const result = await orderService.findPurchaseHistory();

      setOrderList(result.orderList);

      setMessage(result.message ?? "");
    } catch (error) {
      console.error("購入履歴取得中にエラーが発生しました", error);

      setOrderList([]);

      setErrorMessage(
        error instanceof Error ? error.message : "購入履歴の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderService]);

  return {
    orderList,
    message,
    isLoading,
    errorMessage,
    findAll,
  };
};
