"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    ChevronLeft,
    ChevronRight,

} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { usePurchaseProduct } from "@/components/hooks/usePurchaseProduct";
import { useCart } from "@/contexts/CartContext";

/**
 * カルーセルに表示する画像
 *
 * public/images/top/ 配下へ画像を配置してください。
 */
const carouselImages = [
    "/images/top/main-01.jpg",
    "/images/top/main-02.jpg",
    "/images/top/main-03.jpg",
];

export const TopPage = () => {
    const router = useRouter();

    const {
        products,
        isLoading,
        errorMessage,
        findAll,
    } = usePurchaseProduct();

    const {
        totalQuantity,
    } = useCart();

    const [
        currentImageIndex,
        setCurrentImageIndex,
    ] = useState<number>(0);

    /**
     * 初回表示時に商品一覧を取得する
     */
    useEffect(() => {
        void findAll();
    }, [
        findAll,
    ]);

    /**
     * 5秒ごとに画像を切り替える
     */
    useEffect(() => {
        const timerId =
            window.setInterval(
                () => {
                    setCurrentImageIndex(
                        (currentIndex) =>
                            (
                                currentIndex
                                + 1
                            )
                            % carouselImages.length,
                    );
                },
                5000,
            );

        return () => {
            window.clearInterval(
                timerId,
            );
        };
    }, []);

    /**
     * 前の画像を表示する
     */
    const showPreviousImage =
        (): void => {
            setCurrentImageIndex(
                (currentIndex) =>
                    currentIndex === 0
                        ? carouselImages.length
                        - 1
                        : currentIndex - 1,
            );
        };

    /**
     * 次の画像を表示する
     */
    const showNextImage =
        (): void => {
            setCurrentImageIndex(
                (currentIndex) =>
                    (
                        currentIndex
                        + 1
                    )
                    % carouselImages.length,
            );
        };

    return (
        <div className="min-h-screen bg-white">

            <main className="
                mx-auto
                max-w-6xl
                px-6
                pb-12
            ">
                {/* メイン画像カルーセル */}
                <section className="
                    relative
                    overflow-hidden
                    border-x
                    border-b
                    border-gray-300
                ">
                    <div className="
                        relative
                        h-[340px]
                        w-full
                    ">
                        <Image
                            src={
                                carouselImages[
                                currentImageIndex
                                ]
                            }
                            alt="文房具のメイン画像"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    <button
                        type="button"
                        aria-label="前の画像を表示"
                        className="
                            absolute
                            left-4
                            top-1/2
                            flex
                            h-10
                            w-10
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-full
                            bg-white/70
                            shadow
                            hover:bg-white
                        "
                        onClick={
                            showPreviousImage
                        }
                    >
                        <ChevronLeft />
                    </button>

                    <button
                        type="button"
                        aria-label="次の画像を表示"
                        className="
                            absolute
                            right-4
                            top-1/2
                            flex
                            h-10
                            w-10
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-full
                            bg-white/70
                            shadow
                            hover:bg-white
                        "
                        onClick={
                            showNextImage
                        }
                    >
                        <ChevronRight />
                    </button>

                    <div className="
                        absolute
                        bottom-4
                        left-1/2
                        flex
                        -translate-x-1/2
                        gap-2
                    ">
                        {carouselImages.map(
                            (
                                image,
                                index,
                            ) => (
                                <button
                                    key={image}
                                    type="button"
                                    aria-label={
                                        `${index + 1
                                        }枚目を表示`
                                    }
                                    className={`
                                        h-2.5
                                        w-2.5
                                        rounded-full
                                        ${index
                                            === currentImageIndex
                                            ? "bg-green-700"
                                            : "bg-white/80"
                                        }
                                    `}
                                    onClick={() => {
                                        setCurrentImageIndex(
                                            index,
                                        );
                                    }}
                                />
                            ),
                        )}
                    </div>
                </section>

                {/* 商品一覧 */}
                <section className="py-10">
                    <h2 className="
                        mb-8
                        text-center
                        text-2xl
                        font-bold
                        text-gray-800
                    ">
                        おすすめ商品
                    </h2>

                    {isLoading && (
                        <p className="
                            text-center
                            text-gray-500
                        ">
                            商品を読み込んでいます。
                        </p>
                    )}

                    {errorMessage && (
                        <p className="
                            text-center
                            font-semibold
                            text-red-700
                        ">
                            {errorMessage}
                        </p>
                    )}

                    {!isLoading
                        && !errorMessage
                        && products.length === 0 && (
                            <p className="
                                text-center
                                text-gray-500
                            ">
                                商品がありません。
                            </p>
                        )}

                    <div className="
                        grid
                        grid-cols-1
                        gap-8
                        sm:grid-cols-2
                        lg:grid-cols-4
                    ">
                        {products
                            .slice(
                                0,
                                4,
                            )
                            .map(
                                (
                                    product,
                                ) => {
                                    const imageUrl =
                                        product.imageUrl
                                        ?? "/images/no-image.png";

                                    return (
                                        <article
                                            key={
                                                product.productUuid
                                            }
                                            className="
                                                cursor-pointer
                                                rounded-lg
                                                border
                                                border-transparent
                                                p-3
                                                transition
                                                hover:border-gray-200
                                                hover:shadow-md
                                            "
                                            onClick={() => {
                                                router.push(
                                                    `/products/detail/${product.productUuid}`,
                                                );
                                            }}
                                        >
                                            <div className="
                                                relative
                                                mb-4
                                                h-48
                                                w-full
                                            ">
                                                <Image
                                                    src={
                                                        imageUrl
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    fill
                                                    className="
                                                        object-contain
                                                    "
                                                />
                                            </div>

                                            <p className="
                                                text-sm
                                                font-semibold
                                                text-sky-600
                                            ">
                                                {product.name}
                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                font-bold
                                                text-red-500
                                            ">
                                                {product.price
                                                    .toLocaleString()}
                                                円
                                            </p>
                                        </article>
                                    );
                                },
                            )}
                    </div>

                    <div className="
                        mt-10
                        text-center
                    ">
                        <Button
                            type="button"
                            className="
                                bg-green-700
                                hover:bg-green-800
                            "
                            onClick={() => {
                                router.push(
                                    "/products/search",
                                );
                            }}
                        >
                            商品一覧を見る
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    );
};