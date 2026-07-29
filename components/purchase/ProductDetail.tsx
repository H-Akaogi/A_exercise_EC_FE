"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

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
  const { selectedProduct, isLoading, errorMessage, findById } =
    usePurchaseProduct();

  /*
   * かごに関する処理は
   * CartContextから取得する。
   */
  const { cartItems, addCart } = useCart();

  const [quantity, setQuantity] = useState<number>(1);

  const [cartMessage, setCartMessage] = useState<string>("");

  const [cartErrorMessage, setCartErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!params.productUuid) {
      return;
    }

    void findById(params.productUuid);
  }, [params.productUuid, findById]);

  if (isLoading && !selectedProduct) {
    return (
      <p
        className="
                py-12
                text-center
                text-gray-500
            "
      >
        読み込み中です
      </p>
    );
  }

  if (!selectedProduct) {
    return (
      <div
        className="
                py-12
                text-center
            "
      >
        <p
          className="
                    mb-4
                    font-semibold
                    text-red-700
                "
        >
          {errorMessage || "商品が見つかりませんでした。"}
        </p>

        <Button
          type="button"
          onClick={() => {
            router.push("/products/search");
          }}
        >
          商品一覧へ戻る
        </Button>
      </div>
    );
  }

  const stockQuantity = selectedProduct.stockQuantity;

  const currentCartQuantity =
    cartItems.find(
      (item) => item.product.productUuid === selectedProduct.productUuid,
    )?.quantity ?? 0;

  const remainingQuantity = Math.max(stockQuantity - currentCartQuantity, 0);

  const isSoldOut = stockQuantity <= 0;

  const isInvalidQuantity =
    !Number.isInteger(quantity) ||
    quantity <= 0 ||
    quantity > remainingQuantity;

  const canAddCart = !isLoading && !isSoldOut && !isInvalidQuantity;

  const quantityOptions = Array.from(
    {
      length: remainingQuantity,
    },
    (_, index) => index + 1,
  );

  /**
   * 商品をかごへ追加する
   */
  const handleAddCart = (): void => {
    setCartMessage("");
    setCartErrorMessage("");

    try {
      addCart(selectedProduct, quantity);

      setCartMessage(`${selectedProduct.productName}をかごに追加しました。`);

      setQuantity(1);
    } catch (error) {
      setCartErrorMessage(
        error instanceof Error ? error.message : "かごへの追加に失敗しました。",
      );
    }
  };

  return (
    <div
      className="
            mx-auto
            max-w-6xl
            px-6
            py-10
        "
    >
      {errorMessage && (
        <p
          className="
                    mb-4
                    text-center
                    font-semibold
                    text-red-700
                "
        >
          {errorMessage}
        </p>
      )}

      {cartMessage && (
        <p
          className="
                    mb-4
                    text-center
                    font-semibold
                    text-green-700
                "
        >
          {cartMessage}
        </p>
      )}

      {cartErrorMessage && (
        <p
          className="
                    mb-4
                    text-center
                    font-semibold
                    text-red-700
                "
        >
          {cartErrorMessage}
        </p>
      )}

      <div
        className="
                grid
                gap-10
                lg:grid-cols-[minmax(0,1fr)_320px]
            "
      >
        {/* 商品名・商品画像 */}
        <section
          className="
                    min-h-[460px]
                    rounded-lg
                    border
                    border-border
                    bg-white
                    p-8
                    shadow-sm
                "
        >
          <h1
            className="
                        mb-6
                        text-3xl
                        font-bold
                        text-gray-900
                    "
          >
            {selectedProduct.productName}
          </h1>

          <div
            className="
                        relative
                        flex
                        min-h-[340px]
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-md
                        bg-gray-50
                    "
          >
            {selectedProduct.productImage ? (
              <Image
                src={selectedProduct.productImage}
                alt={selectedProduct.productName}
                fill
                priority
                className="
                                    object-contain
                                    p-8
                                "
                sizes="
                                    (max-width: 1024px) 100vw,
                                    70vw
                                "
              />
            ) : (
              <div
                className="
                                flex
                                min-h-[340px]
                                w-full
                                items-center
                                justify-center
                                text-gray-400
                            "
              >
                画像なし
              </div>
            )}
          </div>
        </section>

        {/* 購入操作 */}
        <aside
          className="
                    h-fit
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    p-6
                    shadow-sm
                    lg:sticky
                    lg:top-24
                "
        >
          <p
            className="
                        mb-1
                        text-sm
                        text-gray-500
                    "
          >
            価格
          </p>

          <p
            className="
                        mb-5
                        text-3xl
                        font-bold
                        text-red-600
                    "
          >
            {selectedProduct.price.toLocaleString()}円
          </p>

          {currentCartQuantity > 0 && (
            <p
              className="
                            mb-4
                            rounded-md
                            bg-gray-50
                            p-3
                            text-sm
                            text-gray-600
                        "
            >
              現在かごに
              {currentCartQuantity}
              個入っています。
            </p>
          )}

          <div className="mb-5">
            <label
              htmlFor="quantity"
              className="
                                mb-2
                                block
                                text-sm
                                font-bold
                                text-gray-700
                            "
            >
              数量
            </label>

            <select
              id="quantity"
              value={quantity}
              disabled={isSoldOut || remainingQuantity <= 0}
              onChange={(event) => {
                setQuantity(Number(event.target.value));

                setCartMessage("");
                setCartErrorMessage("");
              }}
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
              {quantityOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {remainingQuantity <= 0 && !isSoldOut && (
            <p
              className="
                                mb-4
                                text-sm
                                font-semibold
                                text-red-700
                            "
            >
              在庫数分がすでにかごに入っています。
            </p>
          )}

          <Button
            type="button"
            className="
                            w-full
                            bg-green-700
                            hover:bg-green-800
                        "
            disabled={!canAddCart}
            onClick={handleAddCart}
          >
            {isSoldOut ? "売り切れ" : "カートに入れる"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="
                            mt-3
                            w-full
                        "
            onClick={() => {
              router.push("/purchase");
            }}
          >
            かごを確認する
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="
                            mt-2
                            w-full
                        "
            onClick={() => {
              router.push("/products/search");
            }}
          >
            商品一覧へ戻る
          </Button>
        </aside>
      </div>
    </div>
  );
};
