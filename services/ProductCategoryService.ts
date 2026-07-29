import { inject, injectable } from "inversify";

import { TYPES } from "@/di/types";

import type { IProductCategoryRepository } from "@/interfaces/IProductCategoryRepository";
import type { IProductCategoryService } from "@/interfaces/IProductCategoryService";
import type { ProductCategory } from "@/models/ProductCategory";

@injectable()
export class ProductCategoryService implements IProductCategoryService {
  constructor(
    @inject(TYPES.IProductCategoryRepository)
    private readonly repository: IProductCategoryRepository,
  ) {}

  public async findAll(): Promise<ProductCategory[]> {
    return await this.repository.findAll();
  }
}
