import { IPurchaseProductService } from "@/interfaces/IPurchaseProductService";
import { Container } from "inversify";
import { TYPES } from "./types";
import { PurchaseProductService } from "@/services/PurchaseProductService";
import { ProductRepository } from "@/infrastructures/ProductRepository";
import { IProductRepository } from "@/interfaces/IProductRepository";
import { ProductCategoryRepository } from "@/infrastructures/ProductCategoryRepository";
import { IProductCategoryRepository } from "@/interfaces/IProductCategoryRepository";
import { IProductCategoryService } from "@/interfaces/IProductCategoryService";
import { ProductCategoryService } from "@/services/ProductCategoryService";
import { PaymentMethodRepository } from "@/infrastructures/PaymentMethodRepository";
import { IPaymentMethodRepository } from "@/interfaces/IPaymentMethodRepository";
import { IPaymentMethodService } from "@/interfaces/IPaymentMethodService";
import { PaymentMethodService } from "@/services/PaymentMethodService";

/**
 * 演習 6-2 データアクセスとサービスを実装する
 * DIコンテナの初期化と依存関係の登録
 */
const container = new Container();
// ---------------------------------------------------------
// バインディング（登録）設定
// ---------------------------------------------------------
// リポジトリの登録(モック版を紐付
container.bind<IProductRepository>(TYPES.IProductRepository).to(ProductRepository).inSingletonScope();
container.bind<IProductCategoryRepository>(TYPES.IProductCategoryRepository).to(ProductCategoryRepository).inSingletonScope();
container.bind<IPaymentMethodRepository>(TYPES.IPaymentMethodRepository).to(PaymentMethodRepository).inSingletonScope();
// サービス(ユースケース)の
container.bind<IPurchaseProductService>(TYPES.IPurchaseProductService).to(PurchaseProductService);
container.bind<IProductCategoryService>(TYPES.IProductCategoryService).to(ProductCategoryService);
container.bind<IPaymentMethodService>(TYPES.IPaymentMethodService).to(PaymentMethodService);


export { container };