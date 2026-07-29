"use client";

import { useCallback, useMemo, useState } from "react";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import type { IProductCategoryService } from "@/interfaces/IProductCategoryService";
import type { ProductCategory } from "@/models/ProductCategory";

export const useProductCategory = () => {
  const service = useMemo(
    () => container.get<IProductCategoryService>(TYPES.IProductCategoryService),
    [],
  );

  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const findAll = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await service.findAll();

      setCategories(result);
    } catch (error) {
      setCategories([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "カテゴリ一覧の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  return {
    categories,
    isLoading,
    errorMessage,
    findAll,
  };
};
