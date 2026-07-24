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
            flex
            items-center
            justify-between
            border-b
            bg-white
            px-8
            py-4
        ">
            <button
                type="button"
                className="text-xl font-bold"
                onClick={() => {
                    router.push(
                        "/products",
                    );
                }}
            >
                商品販売サイト
            </button>

            <Button
                type="button"
                variant="outline"
                className="
                    relative
                    flex
                    items-center
                    gap-2
                "
                onClick={() => {
                    router.push(
                        "/cart",
                    );
                }}
            >
                <ShoppingCart size={22} />

                <span>
                    かご
                </span>

                {totalQuantity > 0 && (
                    <span className="
                        absolute
                        -right-2
                        -top-2
                        flex
                        h-6
                        min-w-6
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
        </header>
    );
};