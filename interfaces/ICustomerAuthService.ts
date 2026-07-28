import type {
    CustomerAuthState,
    CustomerLoginRequest,
} from "@/models/CustomerAuth";

/**
 * UC002・UC008と顧客認証状態を扱うService。
 */
export interface ICustomerAuthService {
    login(
        request: CustomerLoginRequest,
    ): Promise<CustomerAuthState>;

    logout(): Promise<void>;

    getAuthState(): CustomerAuthState;

    getAccessToken(): string | null;

    clearAuthentication(): void;

    subscribeToAuthenticationCleared(
        listener: () => void,
    ): () => void;
}
