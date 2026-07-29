"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import type { IPurchaseProductService } from "@/interfaces/IPurchaseProductService";
import { usePaymentMethod } from "@/components/hooks/usePaymentMethod";
import { useCustomerAuth } from "@/components/hooks/useCustomerAuth";

import { useCart } from "@/contexts/CartContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const CartPage = () => {
  const router = useRouter();

  const { isAuthenticated, isInitialized: isAuthenticationInitialized } =
    useCustomerAuth();

  const {
    paymentMethods,
    isLoading: isPaymentMethodLoading,
    findAll: findAllPaymentMethods,
  } = usePaymentMethod();

  const [paymentMethodId, setPaymentMethodId] = useState<number>(0);

  const {
    cartItems,
    totalQuantity,
    totalPrice,
    removeCart,
    updateCartQuantity,
    clearCart,
  } = useCart();

  const purchaseService = useMemo(
    () => container.get<IPurchaseProductService>(TYPES.IPurchaseProductService),
    [],
  );

  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");

  /**
   * 購入を確定する
   */
  const confirmPurchase = async (): Promise<void> => {
    if (cartItems.length === 0) {
      setErrorMessage("かごに商品がありません");

      return;
    }

    if (paymentMethodId <= 0) {
      setErrorMessage("支払い方法を選択してください");

      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await purchaseService.purchase(
        paymentMethodId,
        cartItems.map((item) => ({
          productUuid: item.product.productUuid,
          quantity: item.quantity,
        })),
      );

      clearCart();

      setPaymentMethodId(0);

      setIsConfirmOpen(false);

      setSuccessMessage("商品の購入が完了しました");
    } catch (error) {
      console.error("商品購入中にエラーが発生しました", error);

      setIsConfirmOpen(false);

      setErrorMessage(
        error instanceof Error ? error.message : "商品の購入に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void findAllPaymentMethods();
  }, [findAllPaymentMethods]);

  return (
    <div
      className="
            mx-auto
            max-w-4xl
            rounded-lg
            border
            bg-white
            p-8
        "
    >
      <h2
        className="
                mb-6
                text-center
                text-2xl
                font-bold
            "
      >
        商品かご
      </h2>

      {successMessage && (
        <p
          className="
                    mb-4
                    text-center
                    font-semibold
                    text-green-700
                "
        >
          {successMessage}
        </p>
      )}

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

      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="mb-4 text-gray-500">商品かごは空です</p>

          <Button
            type="button"
            onClick={() => {
              router.push("/products/search");
            }}
          >
            商品一覧へ戻る
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品名</TableHead>

                <TableHead>単価</TableHead>

                <TableHead>数量</TableHead>

                <TableHead>小計</TableHead>

                <TableHead>削除</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cartItems.map((item) => {
                const stockQuantity = item.product.stockQuantity;

                return (
                  <TableRow key={item.product.productUuid}>
                    <TableCell>{item.product.productName}</TableCell>

                    <TableCell>
                      {item.product.price.toLocaleString()}円
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        max={stockQuantity}
                        value={item.quantity}
                        className="
                                                        w-24
                                                    "
                        onChange={(event) => {
                          updateCartQuantity(
                            item.product.productUuid,
                            Number(event.target.value),
                          );
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {(item.product.price * item.quantity).toLocaleString()}円
                    </TableCell>

                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          removeCart(item.product.productUuid);
                        }}
                      >
                        削除
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div
            className="
                        mt-8
                        space-y-4
                        border-t
                        pt-6
                    "
          >
            <p
              className="
                            text-right
                            text-lg
                            font-bold
                        "
            >
              合計数量：
              {totalQuantity}個
            </p>

            <p
              className="
                            text-right
                            text-xl
                            font-bold
                        "
            >
              合計金額：
              {totalPrice.toLocaleString()}円
            </p>
            <div
              className="
    ml-auto
    w-full
    max-w-sm
"
            >
              <label
                htmlFor="paymentMethod"
                className="
            mb-2
            block
            text-sm
            font-bold
            text-gray-700
        "
              >
                支払い方法
              </label>

              <select
                id="paymentMethod"
                value={paymentMethodId}
                disabled={isLoading || isPaymentMethodLoading}
                onChange={(event) => {
                  setPaymentMethodId(Number(event.target.value));

                  setErrorMessage("");
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
                <option value={0}>支払い方法を選択してください</option>

                {paymentMethods.map((paymentMethod) => (
                  <option key={paymentMethod.id} value={paymentMethod.id}>
                    {paymentMethod.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isLoading}
                onClick={clearCart}
              >
                かごを空にする
              </Button>

              <Button
                type="button"
                className="
                                    flex-1
                                    bg-green-900
                                "
                disabled={isLoading || !isAuthenticationInitialized}
                onClick={() => {
                  if (!isAuthenticated) {
                    router.replace("/login");

                    return;
                  }

                  setIsConfirmOpen(true);
                }}
              >
                購入を確定する
              </Button>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>商品を購入しますか？</AlertDialogTitle>

            <AlertDialogDescription>
              合計数量：
              {totalQuantity}
              個
              <br />
              合計金額：
              {totalPrice.toLocaleString()}円
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>

            <AlertDialogAction
              className="
                                bg-green-900
                            "
              disabled={isLoading}
              onClick={() => {
                void confirmPurchase();
              }}
            >
              {isLoading ? "購入処理中" : "購入する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
