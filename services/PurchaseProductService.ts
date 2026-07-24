import { inject, injectable } from "inversify";
import { TYPES } from "@/di/types";
import type { IMockProductRepository } from "@/interfaces/IMockProductRepository";
import type { IPurchaseProductService } from "@/interfaces/IPurchaseProductService";
import type { Product } from "@/models/Product";

@injectable()
export class PurchaseProductService implements IPurchaseProductService {
    constructor(
        @inject(TYPES.IMockProductRepository)
        private productRepository: IMockProductRepository
    ) { }

    public async findall(): Promise<Product[]> {
        return await this.productRepository.findAll();
    }

    /**
     * 商品UUIDから商品を1件取得する
     *
     * @param productUuid 商品UUID
     * @returns 商品情報。存在しない場合はnull
     */
    public async findById(
        productUuid: string,
    ): Promise<Product | null> {
        return await this.productRepository.findById(
            productUuid,
        );
    }

    public async purchase(
        items: {
            productUuid: string;
            quantity: number;
        }[]
    ): Promise<void> {
        for (const item of items) {
            const result = await this.productRepository.purchaseProduct(
                item.productUuid,
                item.quantity
            );

            if (!result) {
                throw new Error("在庫が不足している商品があります");
            }
        }
    }
}