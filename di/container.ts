import { IPurchaseProductService } from "@/interfaces/IPurchaseProductService";
import { Container } from "inversify";
import { TYPES } from "./types";
import { PurchaseProductService } from "@/services/PurchaseProductService";
import { MockProductRepository } from "@/infrastructures/MockProductRepository";
import { IMockProductRepository } from "@/interfaces/IMockProductRepository";

/**
 * 演習 6-2 データアクセスとサービスを実装する
 * DIコンテナの初期化と依存関係の登録
 */
const container = new Container();
// ---------------------------------------------------------
// バインディング（登録）設定
// ---------------------------------------------------------
// リポジトリの登録(モック版を紐付ける)
container.bind<IMockProductRepository>(TYPES.IMockProductRepository).to(MockProductRepository).inSingletonScope();
// サービス(ユースケース)の登録
container.bind<IPurchaseProductService>(TYPES.IPurchaseProductService).to(PurchaseProductService);


export { container };