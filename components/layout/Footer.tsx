"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCustomerAuth } from "@/components/hooks/useCustomerAuth";

export const Footer = () => {
    const router = useRouter();

    const { isAuthenticated, username, logout } = useCustomerAuth();

    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

    const handleLogout = async (): Promise<void> => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await logout();
        } catch {
            /*
             * APIへのログアウト処理が失敗しても、
             * Context側で認証情報を破棄する。
             */
        } finally {
            setIsLoggingOut(false);
            router.replace("/login");
        }
    };

    const linkClassName = `
    inline-flex
    items-center
    text-sm
    text-green-700
    transition-colors
    hover:text-green-900
    hover:underline
  `;

    return (
        <footer
            className="
        mt-auto
        border-t
        border-green-200
        bg-green-100/80
      "
        >
            <div
                className="
          mx-auto
          max-w-6xl
          px-6
          py-7
        "
            >
                <div>
                    <Link
                        href="/"
                        className="
              inline-block
              text-lg
              font-bold
              text-green-700
              transition-colors
              hover:text-green-900
            "
                    >
                        フルネス文具
                    </Link>

                    <nav
                        aria-label="フッターナビゲーション"
                        className="
              mt-4
              flex
              flex-col
              items-start
              gap-2
            "
                    >
                        <Link
                            href="/"
                            className={linkClassName}
                        >
                            <span aria-hidden="true">»&nbsp;</span>
                            トップ
                        </Link>

                        <Link
                            href="/products/search"
                            className={linkClassName}
                        >
                            <span aria-hidden="true">»&nbsp;</span>
                            商品検索
                        </Link>

                        <Link
                            href="/purchase"
                            className={linkClassName}
                        >
                            <span aria-hidden="true">»&nbsp;</span>
                            買い物かご
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/purchase/history"
                                    className={linkClassName}
                                >
                                    <span aria-hidden="true">»&nbsp;</span>
                                    購入履歴
                                </Link>

                                <button
                                    type="button"
                                    disabled={isLoggingOut}
                                    className={`
                    ${linkClassName}
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  `}
                                    onClick={() => {
                                        void handleLogout();
                                    }}
                                >
                                    <span aria-hidden="true">»&nbsp;</span>

                                    {isLoggingOut
                                        ? "ログアウト中"
                                        : username
                                            ? `ログアウト（${username}さん）`
                                            : "ログアウト（お客様）"}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/account"
                                    className={linkClassName}
                                >
                                    <span aria-hidden="true">»&nbsp;</span>
                                    アカウント登録
                                </Link>

                                <Link
                                    href="/login"
                                    className={linkClassName}
                                >
                                    <span aria-hidden="true">»&nbsp;</span>
                                    ログイン
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                <p
                    className="
            mt-8
            text-center
            text-xs
            font-semibold
            text-green-700
          "
                >
                    Fullness Stationery © All rights reserved.
                </p>
            </div>
        </footer>
    );
};