import { Product } from "@/models/Product";

export interface IPurchaseProductService {
    findall(): Promise<Product[]>;

    purchase(
        items: {
            productUuid: string;
            quantity: number;
        }[]
    ): Promise<void>;
}