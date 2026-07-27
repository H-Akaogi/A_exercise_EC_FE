"use client";

import {
    useEffect,
} from "react";

import {
    useRouter,
} from "next/navigation";

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
    usePurchaseHistory,
} from "@/components/hooks/usePurchaseHistory";

/**
 * 購入履歴一覧画面
 */
export const PurchaseHistory = () => {
    const router =
        useRouter();

    const {
        orderList,
        message,
        isLoading,
        errorMessage,
        findAll,
    } = usePurchaseHistory();

    useEffect(() => {
        void findAll();
    }, [
        findAll,
    ]);

    return (
        <div className="
            mx-auto
            max-w-5xl
            rounded-lg
            border
            bg-white
            p-8
            shadow-sm
        ">
            <h1 className="
                mb-6
                text-center
                text-2xl
                font-bold
            ">
                購入履歴一覧
            </h1>

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

            {isLoading && (
                <p className="
                    text-center
                    text-gray-500
                ">
                    購入履歴を読み込んでいます。
                </p>
            )}

            {!isLoading
                && !errorMessage
                && orderList.length === 0 && (
                    <p className="
                        mb-6
                        text-center
                        text-gray-500
                    ">
                        {message
                            || "購入履歴はありません。"}
                    </p>
                )}

            {!isLoading
                && orderList.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    注文ID
                                </TableHead>

                                <TableHead>
                                    注文日時
                                </TableHead>

                                <TableHead>
                                    注文ステータス
                                </TableHead>

                                <TableHead>
                                    合計金額
                                </TableHead>

                                <TableHead>
                                    詳細
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {orderList.map(
                                (order) => (
                                    <TableRow
                                        key={
                                            order.orderUuid
                                        }
                                    >
                                        <TableCell>
                                            {order.orderUuid}
                                        </TableCell>

                                        <TableCell>
                                            {new Date(
                                                order.orderDate,
                                            ).toLocaleString(
                                                "ja-JP",
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {order.orderStatus}
                                        </TableCell>

                                        <TableCell>
                                            {(
                                                order.totalPrice
                                                ?? 0
                                            ).toLocaleString()}
                                            円
                                        </TableCell>

                                        <TableCell>
                                            <Button
                                                type="button"
                                                className="
                                                    bg-green-900
                                                    hover:bg-green-800
                                                "
                                                onClick={() => {
                                                    router.push(
                                                        `/purchase/history/${order.orderUuid}`,
                                                    );
                                                }}
                                            >
                                                詳細
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ),
                            )}
                        </TableBody>
                    </Table>
                )}

            <div className="
                mt-8
                flex
                justify-center
            ">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        router.push("/");
                    }}
                >
                    トップへ戻る
                </Button>
            </div>
        </div>
    );
};