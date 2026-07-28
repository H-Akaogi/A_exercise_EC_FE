// @vitest-environment jsdom

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    SessionStorageCustomerAuthStore,
} from "@/infrastructures/SessionStorageCustomerAuthStore";

const STORAGE_KEY =
    "customer-auth-session";

describe(
    "SessionStorageCustomerAuthStore",
    () => {
        let store:
            SessionStorageCustomerAuthStore;

        beforeEach(() => {
            store =
                new SessionStorageCustomerAuthStore();
            window.sessionStorage.clear();
            vi.useFakeTimers();
            vi.setSystemTime(
                new Date(
                    "2026-07-27T12:00:00.000Z",
                ),
            );
        });

        afterEach(() => {
            vi.useRealTimers();
            vi.restoreAllMocks();
            window.sessionStorage.clear();
        });

        it(
            "accessTokenとexpiresAtだけを保存して復元する",
            () => {
                const session = {
                    accessToken:
                        "customer-jwt",
                    expiresAt:
                        "2026-07-27T12:30:00.000Z",
                };

                store.save(session);

                expect(
                    store.getValidSession(),
                ).toEqual(session);
                expect(
                    JSON.parse(
                        window.sessionStorage
                            .getItem(
                                STORAGE_KEY,
                            )
                        ?? "{}",
                    ),
                ).toEqual(session);
            },
        );

        it(
            "expiresAtを過ぎた保存データを削除する",
            () => {
                window.sessionStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        accessToken:
                            "expired-jwt",
                        expiresAt:
                            "2026-07-27T11:59:59.999Z",
                    }),
                );

                expect(
                    store.getValidSession(),
                ).toBeNull();
                expect(
                    window.sessionStorage
                        .getItem(
                            STORAGE_KEY,
                        ),
                ).toBeNull();
            },
        );

        it(
            "現在時刻と同じexpiresAtは期限切れとして扱う",
            () => {
                window.sessionStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        accessToken:
                            "expired-jwt",
                        expiresAt:
                            "2026-07-27T12:00:00.000Z",
                    }),
                );

                expect(
                    store.getValidSession(),
                ).toBeNull();
            },
        );

        it(
            "不正なJSONを安全に削除する",
            () => {
                window.sessionStorage.setItem(
                    STORAGE_KEY,
                    "{invalid-json",
                );

                expect(
                    store.getValidSession(),
                ).toBeNull();
                expect(
                    window.sessionStorage
                        .getItem(
                            STORAGE_KEY,
                        ),
                ).toBeNull();
            },
        );

        it(
            "JWTがない保存データを安全に削除する",
            () => {
                window.sessionStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        expiresAt:
                            "2026-07-27T12:30:00.000Z",
                    }),
                );

                expect(
                    store.getValidSession(),
                ).toBeNull();
                expect(
                    window.sessionStorage
                        .getItem(
                            STORAGE_KEY,
                        ),
                ).toBeNull();
            },
        );

        it(
            "期限切れの認証情報は保存しない",
            () => {
                expect(
                    () => {
                        store.save({
                            accessToken:
                                "expired-jwt",
                            expiresAt:
                                "2026-07-27T11:59:59.999Z",
                        });
                    },
                ).toThrow(
                    "有効な認証情報を保存できませんでした。",
                );
            },
        );

        it(
            "sessionStorageへの保存失敗を安全なエラーへ変換する",
            () => {
                vi.spyOn(
                    Storage.prototype,
                    "setItem",
                ).mockImplementation(
                    () => {
                        throw new DOMException(
                            "secret storage detail",
                        );
                    },
                );

                expect(
                    () => {
                        store.save({
                            accessToken:
                                "customer-jwt",
                            expiresAt:
                                "2026-07-27T12:30:00.000Z",
                        });
                    },
                ).toThrow(
                    "認証情報を保存できませんでした。",
                );
            },
        );

        it(
            "clearで保存情報を削除する",
            () => {
                window.sessionStorage.setItem(
                    STORAGE_KEY,
                    "saved-value",
                );

                store.clear();

                expect(
                    window.sessionStorage
                        .getItem(
                            STORAGE_KEY,
                        ),
                ).toBeNull();
            },
        );
    },
);
