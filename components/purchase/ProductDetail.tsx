"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    useParams,
    useRouter,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { usePurchaseProduct } from "@/components/hooks/usePurchaseProduct";
import { useCart } from "@/contexts/CartContext";

export const ProductDetail = () => {
    const params = useParams<{
        productUuid: string;
    }>();

    const router = useRouter();

    /*
     * 商品取得に関する処理は
     * usePurchaseProductから取得する。
     */
    const {
        selectedProduct,
        isLoading,
        errorMessage,
        findById,
    } = usePurchaseProduct();

    /*
     * かごに関する処理は
     * CartContextから取得する。
     */
    const {
        cartItems,
        addCart,
    } = useCart();

    const [
        quantity,
        setQuantity,
    ] = useState<number>(1);

    const [
        cartMessage,
        setCartMessage,
    ] = useState<string>("");

    const [
        cartErrorMessage,
        setCartErrorMessage,
    ] = useState<string>("");

    useEffect(() => {
        if (!params.productUuid) {
            return;
        }

        void findById(
            params.productUuid,
        );
    }, [
        params.productUuid,
        findById,
    ]);

    if (isLoading && !selectedProduct) {
        return (
            <p className="text-center">
                読み込み中です
            </p>
        );
    }

    if (!selectedProduct) {
        return (
            <div className="text-center">
                <p>
                    商品が見つかりませんでした。
                </p>

                <Button
                    className="mt-4"
                    onClick={() => {
                        router.push(
                            "/products/search",
                        );
                    }}
                >
                    商品一覧へ戻る
                </Button>
            </div>
        );
    }

    const stockQuantity =
        selectedProduct.stockQuantity;

    const isSoldOut =
        stockQuantity <= 0;

    const isInvalidQuantity =
        !Number.isInteger(quantity)
        || quantity <= 0
        || quantity > stockQuantity;

    const currentCartQuantity =
        cartItems.find(
            (item) =>
                item.product.productUuid
                === selectedProduct.productUuid,
        )?.quantity ?? 0;

    const canAddCart =
        !isLoading
        && !isSoldOut
        && !isInvalidQuantity
        && currentCartQuantity
        + quantity
        <= stockQuantity;

    /**
     * 商品をかごへ追加する
     */
    const handleAddCart = (): void => {
        setCartMessage("");
        setCartErrorMessage("");

        try {
            addCart(
                selectedProduct,
                quantity,
            );

            setCartMessage(
                `${selectedProduct.productName}をかごに追加しました。`,
            );
        } catch (error) {
            setCartErrorMessage(
                error instanceof Error
                    ? error.message
                    : "かごへの追加に失敗しました。",
            );
        }
    };

    return (
        <div className="
            mx-auto
            max-w-xl
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
            ">
                商品購入
            </h2>

            {errorMessage && (
                <p className="
                    mb-4
                    text-center
                    font-semibold
                    text-red-700
                ">
                    {errorMessage}
                </p>
            )}

            {cartMessage && (
                <p className="
                    mb-4
                    text-center
                    font-semibold
                    text-green-700
                ">
                    {cartMessage}
                </p>
            )}

            {cartErrorMessage && (
                <p className="
                    mb-4
                    text-center
                    font-semibold
                    text-red-700
                ">
                    {cartErrorMessage}
                </p>
            )}

            <div className="space-y-4">
                <div>
                    <span className="font-bold">
                        商品名：
                    </span>

                    {selectedProduct.productName}
                </div>

                <div>
                    <span className="font-bold">
                        価格：
                    </span>

                    {selectedProduct.price
                        .toLocaleString()}
                    円
                </div>

                <div>
                    <span className="font-bold">
                        在庫：
                    </span>

                    {stockQuantity}
                </div>

                <div>
                    <label
                        htmlFor="quantity"
                        className="
                            mb-2
                            block
                            font-bold
                        "
                    >
                        購入個数
                    </label>

                    <Input
                        id="quantity"
                        type="number"
                        min={1}
                        max={stockQuantity}
                        value={quantity}
                        disabled={isSoldOut}
                        onChange={(event) => {
                            setQuantity(
                                Number(
                                    event.target
                                        .value,
                                ),
                            );

                            setCartMessage("");
                            setCartErrorMessage("");
                        }}
                    />
                </div>

                {quantity <= 0 && (
                    <p className="text-sm text-red-700">
                        1個以上を指定してください。
                    </p>
                )}

                {quantity > stockQuantity && (
                    <p className="text-sm text-red-700">
                        在庫数以内の個数を指定してください。
                    </p>
                )}

                {currentCartQuantity > 0 && (
                    <p className="text-sm text-gray-600">
                        現在かごに
                        {currentCartQuantity}
                        個入っています。
                    </p>
                )}

                {currentCartQuantity
                    + quantity
                    > stockQuantity
                    && quantity > 0 && (
                        <p className="text-sm text-red-700">
                            すでにかごへ入っている数量との合計が、
                            在庫数を超えています。
                        </p>
                    )}

                <Button
                    className="
                        w-full
                        bg-green-900
                    "
                    disabled={!canAddCart}
                    onClick={
                        handleAddCart
                    }
                >
                    {isSoldOut
                        ? "売り切れ"
                        : "かごに追加"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        router.push(
                            "/purchase",
                        );
                    }}
                >
                    かごを確認する
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        router.push(
                            "/products/search",
                        );
                    }}
                >
                    商品一覧へ戻る
                </Button>
            </div>
        </div>
    );
};