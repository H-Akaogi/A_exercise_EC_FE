import type { ProductCategory } from "@/models/ProductCategory";

export interface IProductCategoryService {
    findAll():
        Promise<ProductCategory[]>;
}