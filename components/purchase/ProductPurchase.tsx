"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { usePurchaseProduct } from "@/components/hooks/usePurchaseProduct";
import { useProductCategory } from "@/components/hooks/useProductCategory";

export const ProductList = () => {
  const router = useRouter();

  const ITEMS_PER_PAGE = 12;

  const [currentPage, setCurrentPage] = useState<number>(1);

  /**
   * 商品一覧と商品検索
   */
  const {
    products,
    selectedCategoryUuid,
    isLoading,
    errorMessage,
    findAll,
    findByCategory,
  } = usePurchaseProduct();

  /**
   * カテゴリ一覧
   */
  const {
    categories,
    isLoading: isCategoryLoading,
    errorMessage: categoryErrorMessage,
    findAll: findAllCategories,
  } = useProductCategory();

  /**
   * 初回表示時に、
   * 商品一覧とカテゴリ一覧を取得する。
   */
  useEffect(() => {
    void findAll();
    void findAllCategories();
  }, [findAll, findAllCategories]);

  /**
   * カテゴリ選択時の処理
   */
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const categoryUuid = event.target.value;

    setCurrentPage(1);

    void findByCategory(categoryUuid);
  };

  const isPageLoading = isLoading || isCategoryLoading;

  const displayErrorMessage = errorMessage || categoryErrorMessage;

  /**
   * 総ページ数
   */
  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  /**
   * 現在のページに表示する商品
   */
  const paginatedProducts = useMemo(() => {
    const sortedProducts = [...products].sort((left, right) =>
      left.productUuid.localeCompare(right.productUuid),
    );
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const endIndex = startIndex + ITEMS_PER_PAGE;

    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);

  return (
    <div
      className="
            mx-auto
            max-w-5xl
            rounded-lg
            border
            border-border
            bg-white
            p-8
            shadow-sm
        "
    >
      <h2
        className="
                mb-6
                border-b
                pb-4
                text-center
                text-2xl
                font-bold
                text-foreground
            "
      >
        商品一覧
      </h2>

      {/* カテゴリ選択 */}
      <div
        className="
                mb-8
                flex
                items-end
                gap-4
            "
      >
        <div className="w-full max-w-sm">
          <label
            htmlFor="productCategory"
            className="
                            mb-2
                            block
                            text-sm
                            font-bold
                            text-gray-700
                        "
          >
            商品カテゴリ
          </label>

          <select
            id="productCategory"
            value={selectedCategoryUuid}
            disabled={isPageLoading}
            onChange={handleCategoryChange}
            className="
                            h-10
                            w-full
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            text-sm
                            outline-none
                            focus:border-green-700
                            focus:ring-2
                            focus:ring-green-200
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
          >
            <option value="">すべてのカテゴリ</option>

            {categories.map((category) => (
              <option key={category.categoryUuid} value={category.categoryUuid}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isPageLoading || selectedCategoryUuid === ""}
          onClick={() => {
            setCurrentPage(1);
            void findByCategory("");
          }}
        >
          選択解除
        </Button>
      </div>

      {displayErrorMessage && (
        <div
          className="
                    mb-4
                    text-center
                    font-semibold
                    text-red-700
                "
        >
          {displayErrorMessage}
        </div>
      )}

      {isLoading && (
        <p
          className="
                    mb-6
                    text-center
                    text-gray-500
                "
        >
          商品を読み込んでいます。
        </p>
      )}

      {!isLoading && !errorMessage && products.length === 0 && (
        <p
          className="
                        text-center
                        text-gray-500
                    "
        >
          該当する商品がありません。
        </p>
      )}

      <div
        className="
                grid
                grid-cols-1
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
            "
      >
        {paginatedProducts.map((product) => (
          <article
            key={product.productUuid}
            className="
                                overflow-hidden
                                rounded-lg
                                border
                                border-gray-200
                                bg-white
                                shadow-sm
                                transition
                                hover:-translate-y-1
                                hover:shadow-md
                            "
          >
            <div
              className="
                                relative
                                h-48
                                w-full
                                overflow-hidden
                                bg-gray-50
                            "
            >
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="
                                                    object-contain
                                                    p-4
                                                "
                  sizes="
                                                (max-width: 640px) 100vw,
                                                (max-width: 1024px) 50vw,
                                                33vw
                                            "
                />
              ) : (
                <div
                  className="
                                        flex
                                        h-full
                                        w-full 
                                        items-center
                                        justify-center
                                        text-sm
                                        text-gray-400
                                    "
                >
                  画像なし
                </div>
              )}
            </div>

            <div
              className="
                                space-y-4
                                p-5
                            "
            >
              <div>
                <h3
                  className="
                                        text-lg
                                        font-bold
                                        text-gray-900
                                    "
                >
                  {product.name}
                </h3>

                <p
                  className="
                                        mt-1
                                        text-sm
                                        text-gray-500
                                    "
                >
                  {product.productCategory?.name ?? "未設定"}
                </p>
              </div>

              <p
                className="
                                    text-xl
                                    font-bold
                                    text-red-600
                                "
              >
                {product.price.toLocaleString()}円
              </p>

              <Button
                type="button"
                className="
                                        w-full
                                        bg-green-900
                                        hover:bg-green-800
                                    "
                disabled={isLoading}
                onClick={() => {
                  router.push(`/products/detail/${product.productUuid}`);
                }}
              >
                詳細
              </Button>
            </div>
          </article>
        ))}
      </div>
      {products.length > 0 && (
        <div
          className="
        mt-10
        flex
        flex-wrap
        items-center
        justify-center
        gap-2
    "
        >
          <Button
            type="button"
            variant="outline"
            disabled={isPageLoading || currentPage === 1}
            onClick={() => {
              setCurrentPage((page) => Math.max(1, page - 1));
            }}
          >
            前へ
          </Button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) => index + 1,
          ).map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={currentPage === pageNumber ? "default" : "outline"}
              className={
                currentPage === pageNumber
                  ? "bg-green-900 hover:bg-green-800"
                  : ""
              }
              disabled={isPageLoading}
              onClick={() => {
                setCurrentPage(pageNumber);
              }}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            disabled={isPageLoading || currentPage === totalPages}
            onClick={() => {
              setCurrentPage((page) => Math.min(totalPages, page + 1));
            }}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
};
