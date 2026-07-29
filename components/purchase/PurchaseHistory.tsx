"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

import { usePurchaseHistory } from "@/components/hooks/usePurchaseHistory";

/**
 * 購入履歴一覧画面
 */
export const PurchaseHistory = () => {
  const router = useRouter();

  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const purchaseHistoryTopRef =
    useRef<HTMLDivElement | null>(null);

  const { orderList, message, isLoading, errorMessage, findAll } =
    usePurchaseHistory();

  useEffect(() => {
    void findAll();
  }, [findAll]);

  /**
 * 総ページ数
 */
  const totalPages = Math.max(
    1,
    Math.ceil(
      orderList.length / ITEMS_PER_PAGE,
    ),
  );

  /**
 * 現在ページに表示する購入履歴
 */
  const paginatedOrderList = useMemo(() => {
    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    const endIndex =
      startIndex + ITEMS_PER_PAGE;

    return orderList.slice(
      startIndex,
      endIndex,
    );
  }, [orderList, currentPage]);

  /**
 * ページを変更し、
 * 購入履歴一覧の先頭へスクロールする。
 */
  const changePage = (
    pageNumber: number,
  ): void => {
    setCurrentPage(pageNumber);

    window.requestAnimationFrame(() => {
      purchaseHistoryTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div
      ref={purchaseHistoryTopRef}
      className="
            mx-auto
            
            max-w-5xl
            rounded-lg
            bg-white
            p-8
        "
    >
      <h1
        className="
                mb-6
                text-center
                border-b
                text-2xl
                font-bold
            "
      >
        購入履歴一覧
      </h1>

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

      {isLoading && (
        <p
          className="
                    text-center
                    text-gray-500
                "
        >
          購入履歴を読み込んでいます。
        </p>
      )}

      {!isLoading && !errorMessage && orderList.length === 0 && (
        <p
          className="
                        mb-6
                        text-center
                        text-gray-500
                    "
        >
          {message || "購入履歴はありません。"}
        </p>
      )}

      {!isLoading && orderList.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>注文ID</TableHead>

              <TableHead>注文日時</TableHead>

              <TableHead>注文ステータス</TableHead>

              <TableHead>合計金額</TableHead>

              <TableHead>詳細</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedOrderList.map((order) => (
              <TableRow key={order.orderUuid}>
                <TableCell>{order.orderUuid}</TableCell>

                <TableCell>
                  {new Date(order.orderDate).toLocaleString("ja-JP")}
                </TableCell>

                <TableCell>{order.orderStatus}</TableCell>

                <TableCell>
                  {(order.totalPrice ?? 0).toLocaleString()}円
                </TableCell>

                <TableCell>
                  <Button
                    type="button"
                    className="
                                                    bg-green-900
                                                    hover:bg-green-800
                                                "
                    disabled={isLoading}
                    onClick={() => {
                      router.push(`/purchase/history/${order.orderUuid}`);
                    }}
                  >
                    詳細
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {totalPages > 1 && (
        <div
          className="
      mt-8
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
            disabled={
              isLoading ||
              currentPage === 1
            }
            onClick={() => {
              changePage(
                Math.max(
                  1,
                  currentPage - 1,
                ),
              );
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
              variant={
                currentPage === pageNumber
                  ? "default"
                  : "outline"
              }
              className={
                currentPage === pageNumber
                  ? "bg-green-900 hover:bg-green-800"
                  : ""
              }
              disabled={isLoading}
              onClick={() => {
                changePage(pageNumber);
              }}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            disabled={
              isLoading ||
              currentPage === totalPages
            }
            onClick={() => {
              changePage(
                Math.min(
                  totalPages,
                  currentPage + 1,
                ),
              );
            }}
          >
            次へ
          </Button>
        </div>
      )}

      <div
        className="
                mt-8
                flex
                justify-center
            "
      >
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
