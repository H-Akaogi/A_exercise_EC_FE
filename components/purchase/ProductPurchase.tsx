"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { usePurchaseProduct } from "@/components/hooks/usePurchaseProduct";

export const ProductList = () => {
    const router = useRouter();

    const {
        products,
        isLoading,
        errorMessage,
        findAll,
    } = usePurchaseProduct();

    useEffect(() => {
        void findAll();
    }, [findAll]);

    return (
        <div className="
            mx-auto
            max-w-4xl
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

            {errorMessage && (
                <div className="
                    mb-4
                    text-center
                    font-semibold
                    text-red-700
                ">
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
                        <TableHead>詳細</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {products.map(
                        (product) => {
                            const quantity =
                                product.productStock
                                    ?.quantity
                                ?? 0;

                            return (
                                <TableRow
                                    key={
                                        product
                                            .productUuid
                                    }
                                >
                                    <TableCell>
                                        {product.name}
                                    </TableCell>

                                    <TableCell className="
                                        text-right
                                    ">
                                        {product.price
                                            .toLocaleString()}
                                        円
                                    </TableCell>

                                    <TableCell>
                                        {product
                                            .productCategory
                                            ?.name
                                            ?? "未設定"}
                                    </TableCell>

                                    <TableCell>
                                        {quantity}
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            className="
                                                w-full
                                                bg-green-900
                                            "
                                            disabled={
                                                isLoading
                                            }
                                            onClick={() => {
                                                router.push(
                                                    `/products/${product.productUuid}`,
                                                );
                                            }}
                                        >
                                            詳細
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        },
                    )}
                </TableBody>
            </Table>
        </div>
    );
};