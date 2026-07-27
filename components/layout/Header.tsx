"use client";

import {
    ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export const Header = () => {
    const router = useRouter();

    const {
        totalQuantity,
    } = useCart();

    return (
        <header className="
            sticky
            top-0
            z-50
            border-b
            border-green-200
            bg-green-50
        ">
            <div className="
                mx-auto
                flex
                max-w-6xl
                items-center
                justify-between
                px-6
                py-3
            ">
                {/* ロゴ・サイト名 */}
                <button
                    type="button"
                    className="
                        flex
                        items-center
                        gap-2
                        font-bold
                        text-green-700
                    "
                    onClick={() => {
                        router.push("/");
                    }}
                >
                    <span className="
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded
                        bg-green-700
                        text-sm
                        text-white
                    ">
                        ✓
                    </span>

                    <span>
                        フルネス文具
                    </span>
                </button>

                {/* ナビゲーション */}
                <nav className="
                    flex
                    items-center
                    gap-5
                    text-sm
                ">
                    <button
                        type="button"
                        className="
                            text-green-700
                            hover:underline
                        "
                        onClick={() => {
                            router.push(
                                "/products",
                            );
                        }}
                    >
                        商品検索
                    </button>

                    <button
                        type="button"
                        className="
                            text-gray-600
                            hover:underline
                        "
                        onClick={() => {
                            router.push(
                                "/account/register",
                            );
                        }}
                    >
                        アカウント登録
                    </button>

                    <button
                        type="button"
                        className="
                            text-gray-600
                            hover:underline
                        "
                        onClick={() => {
                            router.push(
                                "/login",
                            );
                        }}
                    >
                        ログイン
                    </button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="
                            relative
                            flex
                            items-center
                            gap-1
                        "
                        onClick={() => {
                            router.push(
                                "/cart",
                            );
                        }}
                    >
                        <ShoppingCart
                            className="
                                h-5
                                w-5
                                text-orange-500
                            "
                        />

                        <span>
                            かご
                        </span>

                        {totalQuantity > 0 && (
                            <span className="
                                absolute
                                -right-2
                                -top-2
                                flex
                                h-5
                                min-w-5
                                items-center
                                justify-center
                                rounded-full
                                bg-red-600
                                px-1
                                text-xs
                                font-bold
                                text-white
                            ">
                                {totalQuantity}
                            </span>
                        )}
                    </Button>
                </nav>
            </div>
        </header>
    );
};