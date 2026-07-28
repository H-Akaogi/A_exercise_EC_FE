/**
 * UC002 顧客ログインAPIの入力。
 */
export type CustomerLoginRequest = {
    mailAddress: string;
    password: string;
};

/**
 * UC002 顧客ログインAPIの成功応答。
 */
export type CustomerLoginResponse = {
    accessToken: string;
    expiresAt: string;
};

/**
 * UC008 顧客ログアウトAPIの成功応答。
 */
export type CustomerLogoutResponse = {
    loggedOut: boolean;
};

/**
 * ブラウザに保持する最小限の顧客認証情報。
 */
export type CustomerAuthSession = {
    accessToken: string;
    expiresAt: string;
};

/**
 * UIへ公開する顧客認証状態。
 * アクセストークン自体はUI状態へ含めない。
 */
export type CustomerAuthState = {
    isAuthenticated: boolean;
    expiresAt: string | null;
};

export type CustomerLoginFieldErrors = Partial<
    Record<keyof CustomerLoginRequest, string>
>;

/**
 * ログイン入力値に誤りがある場合のエラー。
 */
export class CustomerLoginValidationError
    extends Error {
    public readonly fieldErrors:
        CustomerLoginFieldErrors;

    constructor(
        fieldErrors: CustomerLoginFieldErrors,
    ) {
        super("ログイン情報の入力内容を確認してください。");
        this.name = "CustomerLoginValidationError";
        this.fieldErrors = fieldErrors;
    }
}
