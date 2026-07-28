import { injectable } from "inversify";

import type {
    ICustomerAuthRepository,
} from "@/interfaces/ICustomerAuthRepository";

import type {
    CustomerLoginRequest,
    CustomerLoginResponse,
    CustomerLogoutResponse,
} from "@/models/CustomerAuth";

type ApiErrorResponse = {
    message?: string;
    detail?: string;
    title?: string;
    errors?: Record<
        string,
        string[] | string
    >;
};

const AUTHENTICATION_FAILED_MESSAGE =
    "メールアドレスまたはパスワードが正しくありません。";

/**
 * 顧客ログイン・ログアウトAPIとの通信を行う。
 */
@injectable()
export class CustomerAuthRepository
    implements ICustomerAuthRepository {
    public async login(
        request: CustomerLoginRequest,
    ): Promise<CustomerLoginResponse> {
        let response: Response;

        try {
            response =
                await fetch(
                "/proxy-api/login",
                {
                    method: "POST",
                    headers: {
                        Accept:
                            "application/json",
                        "Content-Type":
                            "application/json",
                    },
                    cache: "no-store",
                    body: JSON.stringify(request),
                },
            );
        } catch {
            throw new Error(
                "システムエラーが発生しました。",
            );
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(
                    AUTHENTICATION_FAILED_MESSAGE,
                );
            }

            throw new Error(
                await readErrorMessage(
                    response,
                    response.status === 500
                        ? "システムエラーが発生しました。"
                        : "ログイン処理に失敗しました。",
                ),
            );
        }

        const responseData =
            (await response.json()) as
            Partial<CustomerLoginResponse>;

        if (
            typeof responseData.accessToken
                !== "string"
            || responseData.accessToken.length === 0
            || typeof responseData.expiresAt
                !== "string"
            || !Number.isFinite(
                Date.parse(
                    responseData.expiresAt,
                ),
            )
        ) {
            throw new Error(
                "ログイン応答の形式が正しくありません。",
            );
        }

        return {
            accessToken:
                responseData.accessToken,
            expiresAt:
                responseData.expiresAt,
        };
    }

    public async logout(
        accessToken: string,
    ): Promise<CustomerLogoutResponse> {
        let response: Response;

        try {
            response =
                await fetch(
                "/proxy-api/logout",
                {
                    method: "POST",
                    headers: {
                        Accept:
                            "application/json",
                        Authorization:
                            `Bearer ${accessToken}`,
                    },
                    cache: "no-store",
                },
            );
        } catch {
            throw new Error(
                "ログアウト処理に失敗しました。",
            );
        }

        if (!response.ok) {
            throw new Error(
                await readErrorMessage(
                    response,
                    response.status === 401
                        ? "認証の有効期限が切れています。再度ログインしてください。"
                        : "ログアウト処理に失敗しました。",
                ),
            );
        }

        const responseData =
            (await response.json()) as
            Partial<CustomerLogoutResponse>;

        if (responseData.loggedOut !== true) {
            throw new Error(
                "ログアウト応答の形式が正しくありません。",
            );
        }

        return {
            loggedOut: true,
        };
    }
}

const readErrorMessage =
    async (
        response: Response,
        fallbackMessage: string,
    ): Promise<string> => {
        const errorData =
            await response
                .json()
                .catch(
                    () => ({}),
                ) as ApiErrorResponse;

        if (errorData.errors) {
            const validationMessages =
                Object.values(
                    errorData.errors,
                )
                    .flat()
                    .filter(
                        (
                            message,
                        ): message is string =>
                            typeof message
                                === "string"
                            && message.length > 0,
                    );

            if (validationMessages.length > 0) {
                return validationMessages.join(
                    "\n",
                );
            }
        }

        return errorData.message
            ?? errorData.detail
            ?? errorData.title
            ?? fallbackMessage;
    };
