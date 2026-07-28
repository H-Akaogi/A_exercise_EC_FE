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
import { OrderRepository } from "@/infrastructures/OrderRepository";
import { IOrderRepository } from "@/interfaces/IOrderRepository";
import { IOrderService } from "@/interfaces/IOrderService";
import { OrderService } from "@/services/OrderService";
import { CustomerRepository } from "@/infrastructures/CustomerRepository";
import { ICustomerRepository } from "@/interfaces/ICustomerRepository";
import { ICustomerService } from "@/interfaces/ICustomerService";
import { CustomerService } from "@/services/CustomerService";
import { CustomerAuthRepository } from "@/infrastructures/CustomerAuthRepository";
import { SessionStorageCustomerAuthStore } from "@/infrastructures/SessionStorageCustomerAuthStore";
import { CustomerAuthService } from "@/services/CustomerAuthService";
import { ICustomerAuthRepository } from "@/interfaces/ICustomerAuthRepository";
import { ICustomerAuthSessionStore } from "@/interfaces/ICustomerAuthSessionStore";
import { ICustomerAuthService } from "@/interfaces/ICustomerAuthService";

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
container.bind<IOrderRepository>(TYPES.IOrderRepository).to(OrderRepository).inSingletonScope();
container.bind<ICustomerRepository>(TYPES.ICustomerRepository).to(CustomerRepository).inSingletonScope();
container.bind<ICustomerAuthRepository>(TYPES.ICustomerAuthRepository).to(CustomerAuthRepository).inSingletonScope();
container.bind<ICustomerAuthSessionStore>(TYPES.ICustomerAuthSessionStore).to(SessionStorageCustomerAuthStore).inSingletonScope();
// サービス(ユースケース)の
container.bind<IPurchaseProductService>(TYPES.IPurchaseProductService).to(PurchaseProductService);
container.bind<IProductCategoryService>(TYPES.IProductCategoryService).to(ProductCategoryService);
container.bind<IPaymentMethodService>(TYPES.IPaymentMethodService).to(PaymentMethodService);
container.bind<IOrderService>(TYPES.IOrderService).to(OrderService);
container.bind<ICustomerService>(TYPES.ICustomerService).to(CustomerService);
container.bind<ICustomerAuthService>(TYPES.ICustomerAuthService).to(CustomerAuthService).inSingletonScope();


export { container };
