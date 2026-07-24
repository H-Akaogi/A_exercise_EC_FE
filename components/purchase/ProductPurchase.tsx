"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { usePurchaseProduct } from "@/components/hooks/usePurchaseProduct";

export const ProductPurchase = () => {
    const {
        products,
        cartItems,
        totalPrice,
        isLoading,
        isConfirmOpen,
        successMessage,
        errorMessage,
        showFlowerEffect,
        copyCartSummary,
        findAll,
        addCart,
        removeCart,
        clearCart,
        openConfirm,
        closeConfirm,
        confirmPurchase,
    } = usePurchaseProduct();

    useEffect(() => {
        findAll();
    }, []);

    return (

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center border-b pb-4">
                商品購入ページ
            </h2>

            {successMessage && (
                <div className="mb-4 text-green-700 font-semibold text-center">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="mb-4 text-red-700 font-semibold text-center">
                    {errorMessage}
                </div>
            )}

            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>商品名</TableHead>
                        <TableHead>価格</TableHead>
                        <TableHead>カテゴリ</TableHead>
                        <TableHead>在庫</TableHead>
                        <TableHead>購入</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.productUuid}>
                            <TableCell>{product.name}</TableCell>

                            <TableCell className="text-right">
                                {product.price.toLocaleString()}円
                            </TableCell>

                            <TableCell>{product.productCategory?.name}</TableCell>

                            <TableCell>{product.productStock?.quantity!}</TableCell>

                            <TableCell>
                                <Button
                                    className="w-full bg-rose-900"
                                    onClick={() => addCart(product)}
                                    disabled={isLoading || product.productStock?.quantity! <= 0}
                                >
                                    {product.productStock?.quantity! <= 0 ? "売り切れ" : "かごに追加"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-8 p-4 border rounded-lg space-y-4">
                <h3 className="text-xl font-bold text-center">
                    商品かご
                </h3>

                {cartItems.length === 0 ? (
                    <p className="text-center text-gray-500">
                        商品かごは空です
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>商品名</TableHead>
                                <TableHead>数量</TableHead>
                                <TableHead>小計</TableHead>
                                <TableHead>削除</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {cartItems.map((item) => (
                                <TableRow key={item.product.productUuid}>
                                    <TableCell>{item.product.name}</TableCell>

                                    <TableCell>{item.quantity}</TableCell>

                                    <TableCell className="text-right">
                                        {(item.product.price * item.quantity).toLocaleString()}円
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => removeCart(item.product.productUuid)}
                                            disabled={isLoading}
                                        >
                                            削除
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <div className="text-right text-lg font-bold">
                    合計金額：{totalPrice.toLocaleString()}円
                </div>
                <Button
                    variant="outline"
                    onClick={copyCartSummary}
                >
                    かごの内容をコピー
                </Button>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={clearCart}
                        disabled={isLoading || cartItems.length === 0}
                    >
                        かごを空にする
                    </Button>

                    <Button
                        className="flex-1 bg-rose-900"
                        onClick={openConfirm}
                        disabled={isLoading || cartItems.length === 0}
                    >
                        購入する
                    </Button>
                </div>
            </div>

            <AlertDialog open={isConfirmOpen} onOpenChange={closeConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            商品を購入しますか？
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-left">
                            商品点数：{cartItems.length}種類
                            <br />
                            合計金額：{totalPrice.toLocaleString()}円
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeConfirm}>
                            キャンセル
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={confirmPurchase}
                            className="bg-rose-900"
                        >
                            購入する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};