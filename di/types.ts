/**
* 演習 6-2 データアクセスとサービスを実装する
* DIコンテナ用の識別子(Symbol)定義
*/
export const TYPES = {
    // インフラストラクチャ層
    IMockProductRepository: Symbol.for("IMockProductRepository"),
    // サービス(ユースケース)層
    IPurchaseProductService: Symbol.for("IPurchaseProductService"),
};