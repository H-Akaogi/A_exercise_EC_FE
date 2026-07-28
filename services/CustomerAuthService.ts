import {
    inject,
    injectable,
} from "inversify";

import { TYPES } from "@/di/types";

import type {
    ICustomerAuthRepository,
} from "@/interfaces/ICustomerAuthRepository";

import type {
    ICustomerAuthService,
} from "@/interfaces/ICustomerAuthService";

import type {
    ICustomerAuthSessionStore,
} from "@/interfaces/ICustomerAuthSessionStore";

import {
    CustomerLoginValidationError,
    type CustomerAuthState,
    type CustomerLoginFieldErrors,
    type CustomerLoginRequest,
} from "@/models/CustomerAuth";

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * UC002・UC008と顧客認証状態を管理する。
 */
@injectable()
export class CustomerAuthService
    implements ICustomerAuthService {
    private readonly authenticationClearedListeners =
        new Set<() => void>();

    constructor(
        @inject(
            TYPES.ICustomerAuthRepository,
        )
        private readonly repository:
            ICustomerAuthRepository,
        @inject(
            TYPES.ICustomerAuthSessionStore,
        )
        private readonly sessionStore:
            ICustomerAuthSessionStore,
    ) { }

    public async login(
        request: CustomerLoginRequest,
    ): Promise<CustomerAuthState> {
        validateLoginRequest(request);

        const response =
            await this.repository.login(
                request,
            );

        this.sessionStore.save(
            response,
        );

        return {
            isAuthenticated: true,
            expiresAt:
                response.expiresAt,
            username:
                response.username
                ?? null,
        };
    }

    public async logout():
        Promise<void> {
        const session =
            this.sessionStore
                .getValidSession();

        try {
            if (session) {
                await this.repository.logout(
                    session.accessToken,
                );
            }
        } finally {
            /*
             * バックエンドはステートレスJWTのため、
             * API結果にかかわらずフロント側の認証情報を破棄する。
             */
            this.sessionStore.clear();
        }
    }

    public getAuthState():
        CustomerAuthState {
        const session =
            this.sessionStore
                .getValidSession();

        if (!session) {
            const authState:
                CustomerAuthState = {
                isAuthenticated: false,
                expiresAt: null,
                username: null,
            };

            if (
                this.sessionStore
                    .consumeExpirationDetected
                    ?.()
            ) {
                authState.sessionExpired =
                    true;
            }

            return authState;
        }

        return {
            isAuthenticated: true,
            expiresAt:
                session.expiresAt,
            username:
                session.username
                ?? null,
        };
    }

    public getAccessToken():
        string | null {
        const session =
            this.sessionStore
                .getValidSession();

        if (
            !session
            && this.sessionStore
                .consumeExpirationDetected
                ?.()
        ) {
            this.notifyAuthenticationCleared();
        }

        return session
            ?.accessToken
            ?? null;
    }

    public clearAuthentication():
        void {
        this.sessionStore.clear();

        this.notifyAuthenticationCleared();
    }

    private notifyAuthenticationCleared():
        void {
        for (
            const listener
            of this.authenticationClearedListeners
        ) {
            try {
                listener();
            } catch {
                /*
                 * 認証情報の削除は完了済みのため、
                 * UI通知側の例外を呼び出し元へ伝播させない。
                 */
            }
        }
    }

    public subscribeToAuthenticationCleared(
        listener: () => void,
    ): () => void {
        this.authenticationClearedListeners.add(
            listener,
        );

        return () => {
            this.authenticationClearedListeners
                .delete(
                    listener,
                );
        };
    }
}

const validateLoginRequest =
    (
        request: CustomerLoginRequest,
    ): void => {
        const fieldErrors:
            CustomerLoginFieldErrors = {};

        if (
            request.mailAddress
                .trim()
                .length === 0
        ) {
            fieldErrors.mailAddress =
                "メールアドレスを入力してください。";
        } else if (
            !EMAIL_PATTERN.test(
                request.mailAddress,
            )
        ) {
            fieldErrors.mailAddress =
                "正しいメールアドレス形式で入力してください。";
        }

        if (
            request.password
                .trim()
                .length === 0
        ) {
            fieldErrors.password =
                "パスワードを入力してください。";
        } else if (
            request.password.length < 5
            || request.password.length > 20
        ) {
            fieldErrors.password =
                "パスワードは5～20文字で入力してください。";
        }

        if (
            Object.keys(
                fieldErrors,
            ).length > 0
        ) {
            throw new CustomerLoginValidationError(
                fieldErrors,
            );
        }
    };
