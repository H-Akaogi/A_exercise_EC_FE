import type { ProductCategory } from "@/models/ProductCategory";

export interface IProductCategoryRepository {
  findAll(): Promise<ProductCategory[]>;
}
