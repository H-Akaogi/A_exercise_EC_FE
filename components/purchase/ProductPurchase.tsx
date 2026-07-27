"use client";

import {
    useEffect,
} from "react";
import {
    useRouter,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import { usePurchaseProduct } from "@/components/hooks/usePurchaseProduct";
import { useProductCategory } from "@/components/hooks/useProductCategory";

export const ProductList = () => {
    const router = useRouter();

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
    }, [
        findAll,
        findAllCategories,
    ]);

    /**
     * カテゴリ選択時の処理
     */
    const handleCategoryChange = (
        event:
            React.ChangeEvent<HTMLSelectElement>,
    ): void => {
        const categoryUuid =
            event.target.value;

        void findByCategory(
            categoryUuid,
        );
    };

    const isPageLoading =
        isLoading
        || isCategoryLoading;

    const displayErrorMessage =
        errorMessage
        || categoryErrorMessage;


    return (
        <div className="
            mx-auto
            max-w-5xl
            rounded-lg
            border
            border-border
            bg-white
            p-8
            shadow-sm
        ">
            <h2 className="
                mb-6
                border-b
                pb-4
                text-center
                text-2xl
                font-bold
                text-foreground
            ">
                商品一覧
            </h2>

            {/* カテゴリ選択 */}
            <div className="
                mb-8
                flex
                items-end
                gap-4
            ">
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
                        value={
                            selectedCategoryUuid
                        }
                        disabled={
                            isPageLoading
                        }
                        onChange={
                            handleCategoryChange
                        }
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
                        <option value="">
                            すべてのカテゴリ
                        </option>

                        {categories.map(
                            (category) => (
                                <option
                                    key={
                                        category
                                            .categoryUuid
                                    }
                                    value={
                                        category
                                            .categoryUuid
                                    }
                                >
                                    {category.name}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    disabled={
                        isPageLoading
                        || selectedCategoryUuid === ""
                    }
                    onClick={() => {
                        void findByCategory(
                            "",
                        );
                    }}
                >
                    選択解除
                </Button>
            </div>

            {displayErrorMessage && (
                <div className="
                    mb-4
                    text-center
                    font-semibold
                    text-red-700
                ">
                    {displayErrorMessage}
                </div>
            )}

            {isLoading && (
                <p className="
                    mb-6
                    text-center
                    text-gray-500
                ">
                    商品を読み込んでいます。
                </p>
            )}

            {!isLoading
                && !errorMessage
                && products.length === 0 && (
                    <p className="
                        text-center
                        text-gray-500
                    ">
                        該当する商品がありません。
                    </p>
                )}

            <div className="
                grid
                grid-cols-1
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
            ">
                {products.map(
                    (product) => (
                        <article
                            key={
                                product.productUuid
                            }
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
                            {/*
                             * 商品画像用の空白領域
                             */}
                            <div className="
                                h-48
                                w-full
                                bg-gray-50
                            " />

                            <div className="
                                space-y-4
                                p-5
                            ">
                                <div>
                                    <h3 className="
                                        text-lg
                                        font-bold
                                        text-gray-900
                                    ">
                                        {product.name}
                                    </h3>

                                    <p className="
                                        mt-1
                                        text-sm
                                        text-gray-500
                                    ">
                                        {product
                                            .productCategory
                                            ?.name
                                            ?? "未設定"}
                                    </p>
                                </div>

                                <p className="
                                    text-xl
                                    font-bold
                                    text-red-600
                                ">
                                    {product.price
                                        .toLocaleString()}
                                    円
                                </p>

                                <Button
                                    type="button"
                                    className="
                                        w-full
                                        bg-green-900
                                        hover:bg-green-800
                                    "
                                    disabled={
                                        isLoading
                                    }
                                    onClick={() => {
                                        router.push(
                                            `/products/detail/${product.productUuid}`,
                                        );
                                    }}
                                >
                                    詳細
                                </Button>
                            </div>
                        </article>
                    ),
                )}
            </div>
        </div>
    );
};