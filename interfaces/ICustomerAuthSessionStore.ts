import type {
    CustomerAuthSession,
} from "@/models/CustomerAuth";

/**
 * 顧客認証情報のブラウザ保存を抽象化する。
 */
export interface ICustomerAuthSessionStore {
    save(
        session: CustomerAuthSession,
    ): void;

    getValidSession():
        CustomerAuthSession | null;

    clear(): void;
}
