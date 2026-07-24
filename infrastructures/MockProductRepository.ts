import { injectable } from "inversify";

import type { IMockProductRepository } from "../interfaces/IMockProductRepository";
import type { Product } from "../models/Product";

/**
 * 演習 6-2 データアクセスとサービスを実装する
 * 商品リポジトリの実装（モック）
 */
@injectable()
export class MockProductRepository
    implements IMockProductRepository {
    /**
     * テスト用の商品データ
     */
    private mockProducts: Product[] = [
        {
            productUuid: "p-001",
            name: "高性能ノートPC",
            price: 150000,
            imageUrl: null,
            productCategory: {
                categoryUuid: "c-001",
                name: "パソコン",
            },
            productStock: {
                stockUuid: "s-001",
                quantity: 15,
            },
            deleteFlg: 0,
        },
        {
            productUuid: "p-002",
            name: "ワイヤレスマウス",
            price: 3500,
            imageUrl: null,
            productCategory: {
                categoryUuid: "c-002",
                name: "周辺機器",
            },
            productStock: {
                stockUuid: "s-002",
                quantity: 120,
            },
            deleteFlg: 0,
        },
        {
            productUuid: "p-003",
            name: "メカニカルキーボード",
            price: 12000,
            imageUrl: null,
            productCategory: {
                categoryUuid: "c-002",
                name: "周辺機器",
            },
            productStock: {
                stockUuid: "s-003",
                quantity: 1,
            },
            deleteFlg: 0,
        },
    ];

    /**
     * 商品を全件取得する
     *
     * @returns 商品一覧
     */
    public async findAll(): Promise<Product[]> {
        return [...this.mockProducts];
    }

    /**
 * 商品UUIDを指定して商品を1件取得する
 *
 * @param productUuid 商品UUID
 * @returns 該当する商品。存在しない場合はnull
 */
    public async findById(
        productUuid: string,
    ): Promise<Product | null> {
        const product =
            this.mockProducts.find(
                (mockProduct) =>
                    mockProduct.productUuid
                    === productUuid,
            );

        return product ?? null;
    }

    /**
     * 商品を購入し、在庫数を減らす
     *
     * @param productUuid 商品UUID
     * @param quantity 購入数
     * @returns 更新後の商品。購入できない場合はnull
     */
    public async purchaseProduct(
        productUuid: string,
        quantity: number,
    ): Promise<Product | null> {
        /*
         * 0以下の購入数は不正とする。
         */
        if (quantity <= 0) {
            return null;
        }

        const targetProduct =
            this.mockProducts.find(
                (product) =>
                    product.productUuid
                    === productUuid,
            );

        if (!targetProduct) {
            return null;
        }

        /*
         * ProductではproductStockがnullになり得るため、
         * 在庫情報がない場合も購入不可とする。
         */
        if (!targetProduct.productStock) {
            return null;
        }

        /*
         * 在庫数が購入数より少ない場合は購入不可。
         */
        if (
            targetProduct.productStock.quantity
            < quantity
        ) {
            return null;
        }

        const updatedProduct: Product = {
            ...targetProduct,
            productStock: {
                ...targetProduct.productStock,
                quantity:
                    targetProduct
                        .productStock
                        .quantity
                    - quantity,
            },
        };

        this.mockProducts =
            this.mockProducts.map(
                (product) =>
                    product.productUuid
                        === productUuid
                        ? updatedProduct
                        : product,
            );

        return updatedProduct;
    }
}