/**
* 演習 6-2 データアクセスとサービスを実装する
* DIコンテナ用の識別子(Symbol)定義
*/
export const TYPES = {
    // インフラストラクチャ層
    IProductRepository: Symbol.for("IProductRepository"),
    IProductCategoryRepository: Symbol.for("IProductCategoryRepository"),
    IPaymentMethodRepository: Symbol.for("IPaymentMethodRepository"),
    IOrderRepository: Symbol.for("IOrderRepository"),
    // サービス(ユースケース)層
    IPurchaseProductService: Symbol.for("IPurchaseProductService"),
    IProductCategoryService: Symbol.for("IProductCategoryService"),
    IPaymentMethodService: Symbol.for("IPaymentMethodService"),
    IOrderService: Symbol.for("IOrderService"),
};