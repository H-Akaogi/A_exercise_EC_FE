import { injectable } from "inversify";

import type {
    ICustomerAuthSessionStore,
} from "@/interfaces/ICustomerAuthSessionStore";

import type {
    CustomerAuthSession,
} from "@/models/CustomerAuth";

const STORAGE_KEY =
    "customer-auth-session";

/**
 * 顧客JWTをブラウザのsessionStorageへ保存する。
 */
@injectable()
export class SessionStorageCustomerAuthStore
    implements ICustomerAuthSessionStore {
    public save(
        session: CustomerAuthSession,
    ): void {
        const storage =
            getSessionStorage();

        if (!storage) {
            throw new Error(
                "認証情報を保存できませんでした。",
            );
        }

        if (
            !isValidSessionShape(session)
            || isExpired(session)
        ) {
            this.clear();

            throw new Error(
                "有効な認証情報を保存できませんでした。",
            );
        }

        try {
            storage.setItem(
                STORAGE_KEY,
                JSON.stringify(session),
            );
        } catch {
            throw new Error(
                "認証情報を保存できませんでした。",
            );
        }
    }

    public getValidSession():
        CustomerAuthSession | null {
        const storage =
            getSessionStorage();

        if (!storage) {
            return null;
        }

        try {
            const savedSession =
                storage.getItem(
                    STORAGE_KEY,
                );

            if (!savedSession) {
                return null;
            }

            const parsedSession =
                JSON.parse(
                    savedSession,
                ) as unknown;

            if (
                !isValidSessionShape(
                    parsedSession,
                )
                || isExpired(
                    parsedSession,
                )
            ) {
                storage.removeItem(
                    STORAGE_KEY,
                );

                return null;
            }

            return parsedSession;
        } catch {
            try {
                storage.removeItem(
                    STORAGE_KEY,
                );
            } catch {
                // storage自体を利用できない場合は未認証として扱う。
            }

            return null;
        }
    }

    public clear(): void {
        const storage =
            getSessionStorage();

        if (!storage) {
            return;
        }

        try {
            storage.removeItem(
                STORAGE_KEY,
            );
        } catch {
            // 削除不能でも秘密情報をログへ出力しない。
        }
    }
}

const getSessionStorage =
    (): Storage | null => {
        if (typeof window === "undefined") {
            return null;
        }

        try {
            return window.sessionStorage;
        } catch {
            return null;
        }
    };

const isValidSessionShape =
    (
        value: unknown,
    ): value is CustomerAuthSession => {
        if (
            typeof value !== "object"
            || value === null
        ) {
            return false;
        }

        const candidate =
            value as Partial<
                CustomerAuthSession
            >;

        return (
            typeof candidate.accessToken
                === "string"
            && candidate.accessToken.length > 0
            && typeof candidate.expiresAt
                === "string"
            && Number.isFinite(
                Date.parse(
                    candidate.expiresAt,
                ),
            )
        );
    };

const isExpired =
    (
        session: CustomerAuthSession,
    ): boolean =>
        Date.parse(
            session.expiresAt,
        ) <= Date.now();
