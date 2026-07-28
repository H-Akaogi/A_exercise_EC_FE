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

    /**
     * 直前の読み取りで期限切れを検出したか返し、
     * 返却後に検出状態を消費する。
     */
    consumeExpirationDetected?():
        boolean;

    clear(): void;
}
