"use client";

import { useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { usePurchaseHistoryDetail } from "@/components/hooks/usePurchaseHistoryDetail";

/**
 * 購入履歴詳細画面
 */
export const PurchaseHistoryDetail = () => {
  const router = useRouter();

  const params = useParams<{
    orderUuid: string;
  }>();

  const { order, isLoading, hasLoaded, errorMessage, findById } =
    usePurchaseHistoryDetail();

  useEffect(() => {
    if (!params.orderUuid) {
      return;
    }

    void findById(params.orderUuid);
  }, [params.orderUuid, findById]);

  if (isLoading || !hasLoaded) {
    return (
      <p
        className="
                text-center
                text-gray-500
            "
      >
        購入履歴詳細を読み込んでいます。
      </p>
    );
  }

  if (errorMessage) {
    return (
      <div className="text-center">
        <p
          className="
                    mb-4
                    font-semibold
                    text-red-700
                "
        >
          {errorMessage}
        </p>

        <Button
          type="button"
          onClick={() => {
            router.push("/purchase/history");
          }}
        >
          購入履歴一覧へ戻る
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="mb-4">購入履歴が見つかりませんでした。</p>

        <Button
          type="button"
          onClick={() => {
            router.push("/purchase/history");
          }}
        >
          購入履歴一覧へ戻る
        </Button>
      </div>
    );
  }

  return (
    <div
      className="
            mx-auto
            max-w-5xl
            rounded-lg
            border
            bg-white
            p-8
            shadow-sm
        "
    >
      <h1
        className="
                mb-6
                text-center
                text-2xl
                font-bold
            "
      >
        購入履歴詳細
      </h1>

      <div
        className="
                mb-8
                grid
                gap-4
                sm:grid-cols-2
            "
      >
        <p>
          <span className="font-bold">注文ID：</span>

          {order.orderUuid}
        </p>

        <p>
          <span className="font-bold">注文日時：</span>

          {new Date(order.orderDate).toLocaleString("ja-JP")}
        </p>

        <p>
          <span className="font-bold">ステータス：</span>

          {order.orderStatus.name}
        </p>

        <p>
          <span className="font-bold">合計金額：</span>
          {order.amountTotal.toLocaleString()}円
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>商品名</TableHead>

            <TableHead>単価</TableHead>

            <TableHead>数量</TableHead>

            <TableHead>小計</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {order.ordersDetails.map((detail) => (
            <TableRow key={detail.id}>
              <TableCell>{detail.product.name}</TableCell>

              <TableCell>{detail.price.toLocaleString()}円</TableCell>

              <TableCell>{detail.count}</TableCell>

              <TableCell>{detail.subtotal.toLocaleString()}円</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div
        className="
                mt-8
                flex
                justify-center
                gap-4
            "
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.push("/purchase/history");
          }}
        >
          購入履歴一覧へ戻る
        </Button>

        <Button
          type="button"
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
