"use client";

import {
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import type { IPurchaseProductService } from "@/interfaces/IPurchaseProductService";

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

    const {
        cartItems,
        totalQuantity,
        totalPrice,
        removeCart,
        updateCartQuantity,
        clearCart,
    } = useCart();

    const purchaseService =
        useMemo(
            () =>
                container.get<IPurchaseProductService>(
                    TYPES.IPurchaseProductService,
                ),
            [],
        );

    const [
        isConfirmOpen,
        setIsConfirmOpen,
    ] = useState<boolean>(false);

    const [
        isLoading,
        setIsLoading,
    ] = useState<boolean>(false);

    const [
        successMessage,
        setSuccessMessage,
    ] = useState<string>("");

    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string>("");

    /**
     * 購入を確定する
     */
    const confirmPurchase =
        async (): Promise<void> => {
            if (cartItems.length === 0) {
                setErrorMessage(
                    "かごに商品がありません",
                );

                return;
            }

            setIsLoading(true);
            setSuccessMessage("");
            setErrorMessage("");

            try {
                await purchaseService.purchase(
                    cartItems.map(
                        (item) => ({
                            productUuid:
                                item.product
                                    .productUuid,
                            quantity:
                                item.quantity,
                        }),
                    ),
                );

                /*
                 * 購入成功後にかごを空にする。
                 */
                clearCart();

                setIsConfirmOpen(false);

                setSuccessMessage(
                    "商品の購入が完了しました",
                );
            } catch (error) {
                console.error(
                    "商品購入中にエラーが発生しました",
                    error,
                );

                setIsConfirmOpen(false);

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "商品の購入に失敗しました",
                );
            } finally {
                setIsLoading(false);
            }
        };

    return (
        <div className="
            mx-auto
            max-w-4xl
            rounded-lg
            border
            bg-white
            p-8
        ">
            <h2 className="
                mb-6
                text-center
                text-2xl
                font-bold
            ">
                商品かご
            </h2>

            {successMessage && (
                <p className="
                    mb-4
                    text-center
                    font-semibold
                    text-green-700
                ">
                    {successMessage}
                </p>
            )}

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

            {cartItems.length === 0 ? (
                <div className="text-center">
                    <p className="mb-4 text-gray-500">
                        商品かごは空です
                    </p>

                    <Button
                        type="button"
                        onClick={() => {
                            router.push(
                                "/products",
                            );
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
                                <TableHead>
                                    商品名
                                </TableHead>

                                <TableHead>
                                    単価
                                </TableHead>

                                <TableHead>
                                    数量
                                </TableHead>

                                <TableHead>
                                    小計
                                </TableHead>

                                <TableHead>
                                    削除
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {cartItems.map(
                                (item) => {
                                    const stockQuantity =
                                        item.product
                                            .productStock
                                            ?.quantity
                                        ?? 0;

                                    return (
                                        <TableRow
                                            key={
                                                item.product
                                                    .productUuid
                                            }
                                        >
                                            <TableCell>
                                                {
                                                    item.product
                                                        .name
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {item.product
                                                    .price
                                                    .toLocaleString()}
                                                円
                                            </TableCell>

                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={
                                                        stockQuantity
                                                    }
                                                    value={
                                                        item.quantity
                                                    }
                                                    className="
                                                        w-24
                                                    "
                                                    onChange={(
                                                        event,
                                                    ) => {
                                                        updateCartQuantity(
                                                            item.product
                                                                .productUuid,
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {(
                                                    item.product
                                                        .price
                                                    * item.quantity
                                                ).toLocaleString()}
                                                円
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        removeCart(
                                                            item.product
                                                                .productUuid,
                                                        );
                                                    }}
                                                >
                                                    削除
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                },
                            )}
                        </TableBody>
                    </Table>

                    <div className="
                        mt-8
                        space-y-4
                        border-t
                        pt-6
                    ">
                        <p className="
                            text-right
                            text-lg
                            font-bold
                        ">
                            合計数量：
                            {totalQuantity}
                            個
                        </p>

                        <p className="
                            text-right
                            text-xl
                            font-bold
                        ">
                            合計金額：
                            {totalPrice
                                .toLocaleString()}
                            円
                        </p>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                disabled={
                                    isLoading
                                }
                                onClick={
                                    clearCart
                                }
                            >
                                かごを空にする
                            </Button>

                            <Button
                                type="button"
                                className="
                                    flex-1
                                    bg-green-900
                                "
                                disabled={
                                    isLoading
                                }
                                onClick={() => {
                                    setIsConfirmOpen(
                                        true,
                                    );
                                }}
                            >
                                購入を確定する
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <AlertDialog
                open={isConfirmOpen}
                onOpenChange={
                    setIsConfirmOpen
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            商品を購入しますか？
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            合計数量：
                            {totalQuantity}
                            個
                            <br />

                            合計金額：
                            {totalPrice
                                .toLocaleString()}
                            円
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            キャンセル
                        </AlertDialogCancel>

                        <AlertDialogAction
                            className="
                                bg-green-900
                            "
                            disabled={
                                isLoading
                            }
                            onClick={() => {
                                void confirmPurchase();
                            }}
                        >
                            {isLoading
                                ? "購入処理中"
                                : "購入する"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};